import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Machine, MachineStats } from '../models/machine.model';

@Injectable({
  providedIn: 'root',
})
export class MachineService {
  private apiUrl = 'https://localhost:7228/api/Machines';

  constructor(private http: HttpClient) {}

  getMachines(): Observable<Machine[]> {
    return this.http.get<Machine[]>(this.apiUrl);
  }

  getMachine(id: number): Observable<Machine> {
    return this.http.get<Machine>(`${this.apiUrl}/${id}`);
  }

  getMachinesByType(type: string): Observable<Machine[]> {
    return this.http.get<Machine[]>(`${this.apiUrl}/ByType/${type}`);
  }

  getMachinesByStatut(statut: string): Observable<Machine[]> {
    return this.http.get<Machine[]>(`${this.apiUrl}/ByStatut/${statut}`);
  }

  createMachine(machine: Machine): Observable<Machine> {
    return this.http.post<Machine>(this.apiUrl, machine);
  }

  updateMachine(id: number, machine: Machine): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, machine);
  }

  deleteMachine(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getStatistics(): Observable<MachineStats> {
    return this.http.get<MachineStats>(`${this.apiUrl}/Statistics`);
  }
}
