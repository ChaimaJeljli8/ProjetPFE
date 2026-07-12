import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeadlineComplianceReport } from '../models/report.model';
export type { DeadlineComplianceReport };

@Injectable({ providedIn: 'root' })
export class ReportService {
  private api = 'https://localhost:7228/api/Reports';

  constructor(private http: HttpClient) {}

  getDeadlineCompliance(from?: string, to?: string): Observable<DeadlineComplianceReport> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to)   params = params.set('to',   to);
    return this.http.get<DeadlineComplianceReport>(
      `${this.api}/deadline-compliance`, { params }
    );
  }
}
