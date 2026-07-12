import { Injectable, signal, inject, computed, effect, untracked } from '@angular/core';
import { ChatService, ChatMessage } from '../../shared/services/chat.service';
import { LanguageService } from '../../shared/services/language.service';
import { ActivePlanningService } from '../../shared/services/active-planning.service';

@Injectable()
export class ChatbotViewModel {
  private chatService    = inject(ChatService);
  private lang           = inject(LanguageService);
  private activePlanning = inject(ActivePlanningService);

  t = this.lang.t;

  messages        = signal<ChatMessage[]>([]);
  loading         = signal(false);
  error           = signal<string | null>(null);
  ragMode         = signal(false);
  isTimeout       = signal(false);
  lastUserMessage = signal<string | null>(null);

  loadingPhase  = signal<'sql' | 'ai'>('sql');
  private _phaseTimer: ReturnType<typeof setTimeout> | null = null;

  activePlanningId = computed(() => this.activePlanning.id());

  statusLabel = computed(() =>
    this.activePlanningId() !== null
      ? `Expert Planning #${this.activePlanningId()}`
      : 'Assistant général'
  );

  loadingLabel = computed(() => {
    if (!this.loading()) return '';
    if (this.activePlanningId() === null) return 'Génération en cours…';
    return this.loadingPhase() === 'sql'
      ? 'Requêtes SQL en cours…'
      : 'Analyse IA en cours…';
  });



  constructor() {

    effect(() => {
      const id = this.activePlanningId();
      untracked(() => this._onContextChange(id));
    });
  }

  setActivePlanning(id: number | null): void {
    this.activePlanning.set(id);
  }


  private _onContextChange(planningId: number | null): void {

    this.chatService.resetSession();

    this.error.set(null);
    this.isTimeout.set(false);
    this.ragMode.set(false);
    this.lastUserMessage.set(null);
    this._clearPhaseTimer();

    if (planningId !== null) {
      console.log(`[Chatbot] RAG expert mode activated — planningId: ${planningId}`);
    } else {
      console.log('[Chatbot] General assistant mode (no planning selected)');
    }

    this.messages.set(
      planningId !== null
        ? [{ role: 'assistant', content: `Planning #${planningId} chargé. Comment puis-je vous aider ?` }]
        : []
    );
  }

  async send(userText: string): Promise<void> {
    if (!userText.trim() || this.loading()) return;

    const trimmed    = userText.trim();
    const planningId = this.activePlanningId();

    console.log(`[Chatbot] send() — planningId: ${planningId ?? 'null (general mode)'}`);

    this.lastUserMessage.set(trimmed);
    this.messages.update(m => [...m, { role: 'user', content: trimmed }]);
    this.loading.set(true);
    this.error.set(null);
    this.isTimeout.set(false);
    this._startPhaseTimer();

    try {
      const response = await this.chatService.send(trimmed, planningId);
      this.ragMode.set(response.mode === 'rag');
      this.messages.update(m => [...m, { role: 'assistant', content: response.reply }]);
    } catch (e: any) {
      if (e?.status === 504) {
        this.isTimeout.set(true);
        this.error.set(
          'Délai dépassé — Mistral a mis trop de temps. ' +
          'Essayez une question plus courte ou vérifiez qu\'Ollama tourne sur GPU.'
        );
      } else {
        const detail = e?.error?.detail ?? e?.error?.error ?? e?.message ?? this.t().genericError;
        this.error.set(detail);
      }
    } finally {
      this._clearPhaseTimer();
      this.loading.set(false);
    }
  }


  async retry(): Promise<void> {
    const last = this.lastUserMessage();
    if (!last || this.loading()) return;

    this.messages.update(msgs => {
      const idx = [...msgs].reverse().findIndex(m => m.role === 'user' && m.content === last);
      if (idx === -1) return msgs;
      return msgs.filter((_, i) => i !== msgs.length - 1 - idx);
    });

    this.error.set(null);
    this.isTimeout.set(false);
    await this.send(last);
  }


  clear(): void {
    this.chatService.resetSession();
    const id = this.activePlanningId();
    this.messages.set(
      id !== null
        ? [{ role: 'assistant', content: `Planning #${id} — conversation réinitialisée.` }]
        : []
    );
    this.error.set(null);
    this.isTimeout.set(false);
    this.lastUserMessage.set(null);
    this._clearPhaseTimer();
  }

  private _startPhaseTimer(): void {
    this.loadingPhase.set('sql');
    this._phaseTimer = setTimeout(() => this.loadingPhase.set('ai'), 3_000);
  }

  private _clearPhaseTimer(): void {
    if (this._phaseTimer !== null) {
      clearTimeout(this._phaseTimer);
      this._phaseTimer = null;
    }
    this.loadingPhase.set('sql');
  }
}
