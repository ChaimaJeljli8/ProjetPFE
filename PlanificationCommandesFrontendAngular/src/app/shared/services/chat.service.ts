import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { chatEnvironment } from '../../../environments/environment';
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  reply:     string;
  sessionId: string;
  mode:      'general' | 'rag';
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);

  private chatApiUrl = chatEnvironment.chatApiUrl;

  readonly sessionId = signal<string>(this._newSessionId());

  private _resetting = false;

  private _newSessionId(): string {
    return crypto.randomUUID();
  }


  async send(question: string, planningId?: number | null): Promise<ChatResponse> {
    const body: Record<string, unknown> = {
      question,
      sessionId: this.sessionId(),
    };
    if (planningId != null) {
      body['planningId'] = planningId;
    }
    return firstValueFrom(this.http.post<ChatResponse>(this.chatApiUrl, body));
  }

  async resetSession(): Promise<void> {

    if (this._resetting) return;
    this._resetting = true;

    const oldId = this.sessionId();


    this.sessionId.set(this._newSessionId());


    try {
      await firstValueFrom(
        this.http.delete(`${this.chatApiUrl}/${oldId}`)
      );
    } catch {

    } finally {
      this._resetting = false;
    }
  }
}
