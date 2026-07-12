import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ActivePlanningService {
  readonly id = signal<number | null>(null);

  set(id: number | null): void {
    this.id.set(id);
  }
}
