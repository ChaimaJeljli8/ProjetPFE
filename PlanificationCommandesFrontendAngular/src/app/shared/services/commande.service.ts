import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Commande, CreateCommandeDto, UpdateCommandeDto,
  CommandeSearchFilter, CommandeStatistics,
  ImportCommandeDto, ImportResultDto,
} from '../models/commande.model';

@Injectable({ providedIn: 'root' })
export class CommandeService {
  private apiUrl = 'https://localhost:7228/api/Commandes';
  constructor(private http: HttpClient) {}

  getAll(): Observable<Commande[]> {
    return this.http.get<Commande[]>(this.apiUrl);
  }

  getById(id: number): Observable<Commande> {
    return this.http.get<Commande>(`${this.apiUrl}/${id}`);
  }

  search(filter: CommandeSearchFilter): Observable<Commande[]> {
    let params = new HttpParams();
    if (filter.keyword)       params = params.set('keyword',       filter.keyword);
    if (filter.urgence)       params = params.set('urgence',       filter.urgence.toString());
    if (filter.statut)        params = params.set('statut',        filter.statut);
    if (filter.recetteId)     params = params.set('recetteId',     filter.recetteId.toString());
    if (filter.dateExportFrom) params = params.set('dateExportFrom', filter.dateExportFrom);
    if (filter.dateExportTo)   params = params.set('dateExportTo',   filter.dateExportTo);
    return this.http.get<Commande[]>(`${this.apiUrl}/Search`, { params });
  }

  getStatistics(): Observable<CommandeStatistics> {
    return this.http.get<CommandeStatistics>(`${this.apiUrl}/Statistics`);
  }

  create(dto: CreateCommandeDto): Observable<Commande> {
    return this.http.post<Commande>(this.apiUrl, dto);
  }

  update(id: number, dto: UpdateCommandeDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  importJson(rows: ImportCommandeDto[]): Observable<ImportResultDto> {
    return this.http.post<ImportResultDto>(`${this.apiUrl}/Import/Json`, rows);
  }

  importCsv(file: File): Observable<ImportResultDto> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<ImportResultDto>(`${this.apiUrl}/Import/Csv`, form);
  }
}
