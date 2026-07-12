import { Injectable }       from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError }        from 'rxjs';
import { catchError }                    from 'rxjs/operators';
import { AlertSummaryDto }               from '../models/alert.model';
import { environment }                   from '../../../environments/environment';
import { LanguageService }               from './language.service';

export type AlertOperation =
  | 'load'
  | 'refresh'
  | 'dismiss'
  | 'dismissAllDelay'
  | 'dismissAllBottleneck';

export interface AlertError {
  message: string;
  status: number;
  operation: AlertOperation;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  private readonly api = `${environment.apiUrl}/Alerts`;

  constructor(
    private http: HttpClient,
    private lang: LanguageService,
  ) {}

  //  Public API

  getCurrent(): Observable<AlertSummaryDto> {
    return this.http.get<AlertSummaryDto>(this.api).pipe(
      catchError(err => throwError(() => this._toAlertError(err, 'load'))),
    );
  }

  refresh(): Observable<AlertSummaryDto> {
    return this.http.post<AlertSummaryDto>(`${this.api}/refresh`, {}).pipe(
      catchError(err => throwError(() => this._toAlertError(err, 'refresh'))),
    );
  }


  dismiss(id: number): Observable<void> {
    return this.http.patch<void>(`${this.api}/${id}/dismiss`, {}).pipe(
      catchError(err => throwError(() => this._toAlertError(err, 'dismiss'))),
    );
  }

  dismissAllDelay(): Observable<void> {
    return this.http.patch<void>(`${this.api}/dismiss-all/delay`, {}).pipe(
      catchError(err => throwError(() => this._toAlertError(err, 'dismissAllDelay'))),
    );
  }

  /** Dismiss all active bottleneck alerts. */
  dismissAllBottleneck(): Observable<void> {
    return this.http.patch<void>(`${this.api}/dismiss-all/bottleneck`, {}).pipe(
      catchError(err => throwError(() => this._toAlertError(err, 'dismissAllBottleneck'))),
    );
  }

  private _toAlertError(err: HttpErrorResponse, operation: AlertOperation): AlertError {
    const t = this.lang.t();
    const status = err.status ?? 0;

    let message: string;
    if (status === 0) {
      message = t['alertErrNetwork'] ?? 'Cannot reach the server. Make sure the backend is running.';
    } else if (status === 401) {
      message = t['alertErrUnauthorized'] ?? 'Session expired (401). Please sign in again.';
    } else if (status === 403) {
      message = t['alertErrForbidden'] ?? 'Access denied (403).';
    } else if (status === 404) {
      message = t['alertErrNotFound'] ?? 'Alert not found (404). It may already have been removed.';
    } else if (status >= 500) {
      message = t['alertErrServer'] ?? 'Server error while processing alerts.';
    } else {
      message = t['alertErrServer'] ?? `Unexpected error (${status}).`;
    }

    if (status !== 0) {
      const operationMsg = this._operationMessage(operation, t);
      if (operationMsg) message = operationMsg;
    }

    return { message, status, operation };
  }


  private _operationMessage(operation: AlertOperation, t: Record<string, string>): string | null {
    switch (operation) {
      case 'load':              return t['alertErrLoadFailed']            ?? null;
      case 'refresh':           return t['alertErrRefreshFailed']         ?? null;
      case 'dismiss':           return t['alertErrDismissFailed']         ?? null;
      case 'dismissAllDelay':   return t['alertErrDismissAllDelay']       ?? null;
      case 'dismissAllBottleneck': return t['alertErrDismissAllBottleneck'] ?? null;
      default:                  return null;
    }
  }
}
