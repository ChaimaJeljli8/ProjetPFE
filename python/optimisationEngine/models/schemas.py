from typing import List, Optional
from pydantic import BaseModel, Field

class RunRequest(BaseModel):
    token:        str  # JWT transmis à FastAPI pour qu'il puisse appeler l'API .NET
    commandeIds:  Optional[List[int]] = None  # si None → planifie toutes les commandes "En attente"
    maxMachinesPerOp: int = Field(default=1, ge=1, le=3)  # nombre max de machines en parallèle par opération
    startDatetime: Optional[str] = None # si None → démarre maintenant


class GanttRow(BaseModel):
    numeroCommande:          str
    quantite:                int
    recetteId:               int
    urgence:                 int
    nomOperation:            str
    machineId:               int
    machineName:             str
    startPM:                 int  # offset en minutes depuis le début du planning
    endPM:                   int
    dureeMinutes:            int
    tempsChargementMinutes:  int
    tempsDecharementMinutes: int
    dureeTotale:             int
    lotSize:                 int
    quantiteLot:             int
    lotIdx:                  int
    nbLots:                  int
    dateStart:               str
    dateEnd:                 str
    dateExport:              str


class RunResponse(BaseModel):
    status:       str
    makespanDays: int
    makespanPM:   int
    startDate:    str
    rows:         List[GanttRow]
    warnings:     List[str]