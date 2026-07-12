import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { GanttRow, PlanningDetail, PlanningSummary } from '../models/planning.model';

export type { GanttRow, PlanningDetail, PlanningSummary };

@Injectable({ providedIn: 'root' })
export class PlanningService {
  private api = 'https://localhost:7228/api/Planning';

  constructor(private http: HttpClient) {}

  runPlanning(
    commandeIds: number[] = [],
    maxMachinesPerOp: number = 1,
    startDatetime?: string,
  ): Observable<PlanningDetail> {
    const body: Record<string, unknown> = {
      commandeIds:      commandeIds ?? [],
      maxMachinesPerOp: Math.max(1, Math.min(3, maxMachinesPerOp)),
    };

    if (startDatetime) {
      body['startDatetime'] = startDatetime;
    }

    console.log('[PlanningService] runPlanning body:', body);

    return this.http
      .post<PlanningDetail>(`${this.api}/run`, body)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('[PlanningService] runPlanning error:', err);
          return throwError(() => err);
        })
      );
  }

  getAll(): Observable<PlanningSummary[]> {
    return this.http.get<PlanningSummary[]>(this.api);
  }

  getById(id: number): Observable<PlanningDetail> {
    return this.http.get<PlanningDetail>(`${this.api}/${id}`);
  }

  downloadExcel(id: number): Observable<void> {
    return this.http
      .get(`${this.api}/${id}/export/excel`, {
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        map(response => {
          const blob = response.body!;
          const cd   = response.headers.get('Content-Disposition') ?? '';
          const match = cd.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          const filename = match
            ? match[1].replace(/['"]/g, '')
            : `planning_${id}_${this.nowStamp()}.xlsx`;
          this.triggerDownload(blob, filename);
        })
      );
  }

  downloadPdf(id: number): Observable<void> {
    return this.http
      .get(`${this.api}/${id}/export/pdf`, {
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        map(response => {
          const blob     = response.body!;
          const cd       = response.headers.get('Content-Disposition') ?? '';
          const match    = cd.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          const filename = match
            ? match[1].replace(/['"]/g, '')
            : `planning_${id}_${this.nowStamp()}.pdf`;
          this.triggerDownload(blob, filename);
        })
      );
  }

  //  Helpers

  private triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download  = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }

  private nowStamp(): string {
    return new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
  }
}
