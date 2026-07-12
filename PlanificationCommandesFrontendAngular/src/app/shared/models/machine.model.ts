export interface Machine {
  id?: number;
  nomMachine: string;
  capaciteMax: number;
  statut: 'Fonctionnel' | 'Non fonctionnel';
  operations?: string;
}

export interface MachineStats {
  totalMachines: number;
  fonctionnels: number;
  nonFonctionnels: number;
}
