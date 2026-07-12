import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateRecetteDto, Recette, UpdateRecetteDto } from '../models/recette.model';


@Injectable({ providedIn: 'root' })
export class RecetteService {
  private apiUrl = 'https://localhost:7228/api/Recettes';
  constructor(private http: HttpClient) {}

  getAll(): Observable<Recette[]> {
    return this.http.get<Recette[]>(this.apiUrl);
  }

  getById(id: number): Observable<Recette> {
    return this.http.get<Recette>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateRecetteDto): Observable<Recette> {
    return this.http.post<Recette>(this.apiUrl, dto);
  }

  update(id: number, dto: UpdateRecetteDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
