from typing import Dict, List, Optional

import httpx
from fastapi import HTTPException

from optimisationEngine.models.domain import Commande, Machine, OperationRecette

DOTNET_BASE_URL = "https://localhost:7228/api"   # URL de l'API .NET 

async def _fetch(client: httpx.AsyncClient, path: str, token: str):
    headers = {"Authorization": f"Bearer {token}"}
    r = await client.get(
        f"{DOTNET_BASE_URL}{path}",
        headers=headers,
        timeout=30,
    )
    if r.status_code != 200:
        raise HTTPException(
            status_code=r.status_code,
            detail=f"Backend error on {path}: {r.text[:200]}",
        )
    return r.json()


async def load_live_data(
    token: str,
    commande_ids: Optional[List[int]] = None,
):
     # verify=False : certificat SSL auto-signé en développement local
    async with httpx.AsyncClient(verify=False) as client:
        raw_cmds     = await _fetch(client, "/Commandes",  token)
        raw_machines = await _fetch(client, "/Machines",   token)
        raw_recettes = await _fetch(client, "/Recettes",   token)
    # Filtre côté Python : seules les commandes "En attente" sont planifiables
    commandes = [
        Commande(c) for c in raw_cmds
        if c.get("statut", "").lower() == "en attente"
    ]
    if commande_ids:
        commandes = [c for c in commandes if c.Id in commande_ids]


    machines = [Machine(m) for m in raw_machines]


    ops_by_recette: Dict[int, List[OperationRecette]] = {}
    for r in raw_recettes:
        rid = r["id"]
        ops = [
            OperationRecette({**op, "recetteId": rid})
            for op in r.get("operations", [])
        ]
        # Les opérations sont triées par ordre pour respecter la séquence de la recette
        ops.sort(key=lambda o: o.Ordre)
        ops_by_recette[rid] = ops

    return commandes, machines, ops_by_recette


def validate(
    commandes: List[Commande],
    machines:  List[Machine],
    ops_by_recette: Dict[int, List[OperationRecette]],
) -> List[str]:
     # Vérifie que chaque opération de chaque commande a au moins une machine capable de l'exécuter
     # Retourne des warnings (pas des erreurs bloquantes) — le planning peut quand même tourner
    machines_ok = [m for m in machines if m.is_available()]
    available   = {
        op_name.lower()
        for m in machines_ok
        for op_name in m.operations_list()
    }

    warnings: List[str] = []
    for cmd in commandes:
        ops = ops_by_recette.get(cmd.RecetteId)
        if not ops:
            warnings.append(
                f"[{cmd.NumeroCommande}] RecetteId={cmd.RecetteId} has no operations"
            )
            continue
        for op in ops:
            if op.NomOperation.lower() not in available:
                warnings.append(
                    f"[{cmd.NumeroCommande}] Operation '{op.NomOperation}'"
                    f" has no available machine"
                )
    return warnings