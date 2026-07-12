import {
  Component, inject, signal, ViewChild, ElementRef,
  AfterViewChecked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotViewModel } from './chatbot.viewmodel';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [ChatbotViewModel],
  template: `
    <!-- ── FAB ── -->
    <button
      (click)="open.set(!open())"
      class="cb-fab"
      [class.cb-fab--open]="open()"
      [class.cb-fab--rag]="vm.activePlanningId() !== null"
      [title]="vm.t().chatbotToggleTitle"
      aria-label="Toggle chat"
    >
      <span class="cb-fab__ring"></span>
      <span class="cb-fab__icon">
        <svg *ngIf="!open()" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          <circle cx="9"  cy="10" r="1" fill="currentColor" stroke="none"/>
          <circle cx="12" cy="10" r="1" fill="currentColor" stroke="none"/>
          <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none"/>
        </svg>
        <svg *ngIf="open()" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6"  y1="6" x2="18" y2="18"/>
        </svg>
      </span>
      <span class="cb-fab__dot" *ngIf="!open() && vm.messages().length > 0"></span>
      <span class="cb-fab__rag-pill" *ngIf="!open() && vm.activePlanningId() !== null">
        #{{ vm.activePlanningId() }}
      </span>
    </button>

    <!-- ── Panel ── -->
    <div class="cb-panel" [class.cb-panel--visible]="open()">

      <!-- ── Header ── -->
      <header class="cb-header">
        <div class="cb-header__left">
          <div class="cb-avatar" [class.cb-avatar--rag]="vm.activePlanningId() !== null">
            <svg *ngIf="vm.activePlanningId() !== null"
                 width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none"/>
            </svg>
            <svg *ngIf="vm.activePlanningId() === null"
                 width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span class="cb-avatar__pulse"></span>
          </div>
          <div class="cb-header__info">
            <span class="cb-header__name">{{ vm.t().chatbotTitle }}</span>
            <span class="cb-header__status">
              <span class="cb-status-dot" [class.cb-status-dot--rag]="vm.activePlanningId() !== null"></span>
              {{ vm.statusLabel() }}
            </span>
          </div>
        </div>

        <div class="cb-header__controls">
          <span class="cb-rag-badge" *ngIf="vm.ragMode()"></span>
          <button class="cb-header-btn cb-refresh-btn" [title]="'Actualiser'" (click)="vm.clear()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
            </svg>
          </button>
          <button class="cb-header-btn cb-close-btn" (click)="open.set(false)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6"  y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </header>

      <!-- Context banner — shown when expert mode is active -->
      <div class="cb-context-banner" *ngIf="vm.activePlanningId() !== null">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>Mode expert — planning <strong>numéro {{ vm.activePlanningId() }}</strong></span>
      </div>

      <!-- ── Messages ── -->
      <div class="cb-messages" #scrollRef>

        <!-- Empty state (general mode only) -->
        <div class="cb-empty" *ngIf="vm.messages().length === 0 && !vm.loading()">
          <div class="cb-empty__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <p class="cb-empty__title">{{ vm.t().chatbotEmptyHint }}</p>
        </div>

        <!-- Bubbles -->
        <div
          *ngFor="let msg of vm.messages()"
          class="cb-bubble-wrap"
          [class.cb-bubble-wrap--user]="msg.role === 'user'"
          [class.cb-bubble-wrap--ai]="msg.role === 'assistant'"
        >
          <div class="cb-bubble"
               [class.cb-bubble--user]="msg.role === 'user'"
               [class.cb-bubble--ai]="msg.role === 'assistant'">
            <pre class="cb-bubble__text">{{ msg.content }}</pre>
          </div>
          <span class="cb-bubble__label">{{ msg.role === 'user' ? 'Vous' : 'IA' }}</span>
        </div>

        <!-- Typing indicator with phase-aware label -->
        <div class="cb-bubble-wrap cb-bubble-wrap--ai" *ngIf="vm.loading()">
          <div class="cb-bubble cb-bubble--ai cb-bubble--typing">
            <span></span><span></span><span></span>
          </div>
          <span class="cb-bubble__label">IA</span>
        </div>
        <p class="cb-loading-label" *ngIf="vm.loading()">{{ vm.loadingLabel() }}</p>

        <!-- Error with optional retry button -->
        <div class="cb-error" *ngIf="vm.error()">
          <div class="cb-error__icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div class="cb-error__content">
            <p class="cb-error__text">{{ vm.error() }}</p>
            <button
              *ngIf="vm.isTimeout() && vm.lastUserMessage()"
              class="cb-retry-btn"
              (click)="vm.retry()"
              [disabled]="vm.loading()"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
              </svg>
              <span>Réessayer</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ── Input ── -->
      <div class="cb-input-area">
        <div class="cb-input-wrap">
          <textarea
            #inputRef
            [(ngModel)]="inputText"
            (keydown.enter)="onEnter($event)"
            [placeholder]="vm.activePlanningId() !== null
              ? 'Posez une question sur le planning #' + vm.activePlanningId() + '…'
              : vm.t().chatbotInputPlaceholder"
            rows="1"
            class="cb-input"
            [disabled]="vm.loading()"
          ></textarea>
          <button
            class="cb-send"
            (click)="submit()"
            [disabled]="!inputText.trim() || vm.loading()"
            [title]="'Envoyer (Entrée)'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <p class="cb-input-hint">Appuyez sur <kbd>Entrée</kbd> pour envoyer</p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --cb-accent: #4f7bff;
      --cb-accent-2: #6b9aff;
      --cb-accent-3: #8ba3ff;
      --cb-user-bg: #4f7bff;
      --cb-ai-bg: rgba(79,123,255,.07);
      --cb-border: rgba(79,123,255,.18);
      --cb-text: #1a1a2e;
      --cb-text-muted: #6b7280;
      --cb-panel-bg: #ffffff;
      --cb-danger: #ff4d6d;
    }

    @media (prefers-color-scheme: dark) {
      :host {
        --cb-ai-bg: rgba(79,123,255,.1);
        --cb-border: rgba(79,123,255,.2);
        --cb-text: #f0f0f0;
        --cb-text-muted: #8b8b8b;
        --cb-panel-bg: #0e0e12;
      }
      .cb-panel {
        box-shadow: 0 20px 60px rgba(0,0,0,.6), 0 0 1px rgba(79,123,255,.3);
      }
      .cb-fab__rag-pill {
        background: #1a1a2e; color: var(--cb-accent-2);
        border-color: rgba(79,123,255,.4);
      }
    }

    /* ── FAB ── */
    .cb-fab {
      position: fixed; bottom: 32px; right: 24px;
      width: 52px; height: 52px; border-radius: 50%;
      background: var(--cb-accent);
      color: #fff; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      z-index: 999; font-size: 24px; overflow: visible;
      transition: all .24s cubic-bezier(.34,.1,.64,.99);
      box-shadow: 0 4px 24px rgba(79,123,255,.4);
    }
    .cb-fab:hover { transform: scale(1.1); box-shadow: 0 6px 32px rgba(79,123,255,.55), 0 0 0 5px rgba(79,123,255,.12); }
    .cb-fab--rag { background: linear-gradient(135deg, var(--cb-accent) 0%, var(--cb-accent-2) 100%); }
    .cb-fab__ring {
      position: absolute; width: 52px; height: 52px;
      border: 2px solid var(--cb-accent); border-radius: 50%;
      opacity: 0; animation: pulse-ring 1.5s ease-out infinite; pointer-events: none;
    }
    @keyframes pulse-ring {
      0% { transform: scale(1); opacity: .8; }
      100% { transform: scale(1.55); opacity: 0; }
    }
    .cb-fab__icon { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; }
    .cb-fab__dot {
      position: absolute; width: 11px; height: 11px; background: #22c55e;
      border: 2px solid #fff;
      border-radius: 50%; top: 1px; right: 1px;
      animation: pulse-dot 2s ease-in-out infinite; z-index: 2;
    }
    @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: .6; } }
    .cb-fab__rag-pill {
      position: absolute; bottom: -9px; left: 50%; transform: translateX(-50%);
      background: #fff; color: var(--cb-accent);
      padding: 2px 7px; border-radius: 20px;
      font-size: 9px; font-weight: 700; white-space: nowrap;
      border: 1.5px solid rgba(79,123,255,.35);
      box-shadow: 0 2px 8px rgba(79,123,255,.2);
      z-index: 2; line-height: 1.4;
    }

    /* ── Panel ── */
    .cb-panel {
      position: fixed; bottom: 100px; right: 24px;
      width: 384px; height: 520px; border-radius: 16px;
      background: var(--cb-panel-bg); border: 1px solid var(--cb-border);
      display: flex; flex-direction: column; z-index: 998;
      opacity: 0; visibility: hidden; transform: scale(.92) translateY(20px);
      transition: all .28s cubic-bezier(.34,.1,.64,.99);
      box-shadow: 0 8px 40px rgba(0,0,0,.12), 0 2px 12px rgba(0,0,0,.08), 0 0 0 1px rgba(79,123,255,.15);
      overflow: hidden;
    }
    .cb-panel--visible {
      opacity: 1; visibility: visible; transform: scale(1) translateY(0);
    }
    @media (max-width: 480px) {
      .cb-panel { width: calc(100vw - 32px); bottom: 80px; right: 16px; left: 16px; }
    }

    /* ── Header ── */
    .cb-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 16px; border-bottom: 1px solid var(--cb-border);
      background: linear-gradient(180deg, rgba(79,123,255,.06) 0%, transparent 100%);
      gap: 12px; flex-shrink: 0;
    }
    .cb-header__left {
      display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;
    }
    .cb-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(79,123,255,.15); border: 1.5px solid var(--cb-border);
      display: flex; align-items: center; justify-content: center;
      color: var(--cb-accent); position: relative; flex-shrink: 0;
      transition: all .2s ease;
    }
    .cb-avatar--rag { background: rgba(79,123,255,.25); border-color: var(--cb-accent); }
    .cb-avatar__pulse {
      position: absolute; width: 100%; height: 100%; border-radius: 50%;
      border: 1.5px solid var(--cb-accent);
      animation: avatar-pulse 2.2s ease-in-out infinite;
    }
    @keyframes avatar-pulse {
      0% { opacity: 1; transform: scale(1); }
      100% { opacity: 0; transform: scale(1.4); }
    }
    .cb-header__info {
      display: flex; flex-direction: column; gap: 4px; min-width: 0;
    }
    .cb-header__name {
      font-size: 13.5px; font-weight: 600; color: var(--cb-text);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .cb-header__status {
      font-size: 11px; color: var(--cb-text-muted);
      display: flex; align-items: center; gap: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .cb-status-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #666; animation: status-blink 2s ease-in-out infinite;
    }
    .cb-status-dot--rag { background: #10ff00; animation: none; }
    @keyframes status-blink { 0%, 100% { opacity: .6; } 50% { opacity: 1; } }
    .cb-header__controls {
      display: flex; align-items: center; gap: 4px;
    }
    .cb-rag-badge {
      font-size: 9.5px; font-weight: 700; letter-spacing: .05em;
      padding: 4px 8px; border-radius: 6px;
      background: rgba(79,123,255,.25); color: var(--cb-accent);
      text-transform: uppercase;
    }
    .cb-header-btn {
      width: 32px; height: 32px; border-radius: 8px;
      background: rgba(79,123,255,.1); border: 1px solid var(--cb-border);
      color: var(--cb-text-muted); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all .18s ease; padding: 0;
    }
    .cb-header-btn:hover {
      background: rgba(79,123,255,.18); color: var(--cb-accent);
      border-color: var(--cb-accent);
    }
    .cb-header-btn:active { transform: scale(.94); }

    /* ── Context banner ── */
    .cb-context-banner {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 14px; margin: 0;
      background: rgba(79,123,255,.12); border-bottom: 1px solid var(--cb-border);
      font-size: 11.5px; color: var(--cb-text-muted); flex-shrink: 0;
    }
    .cb-context-banner svg { flex-shrink: 0; color: var(--cb-accent); }
    .cb-context-banner strong { color: var(--cb-accent); font-weight: 600; }
    .cb-context-banner__badge {
      margin-left: auto; padding: 2px 8px; border-radius: 4px;
      background: rgba(79,123,255,.2); font-weight: 600;
      font-size: 10px; color: var(--cb-accent); flex-shrink: 0;
    }

    /* ── Messages container ── */
    .cb-messages {
      flex: 1; overflow-y: auto; padding: 12px 12px;
      display: flex; flex-direction: column; gap: 10px;
      scrollbar-width: thin; scrollbar-color: rgba(79,123,255,.2) transparent;
    }
    .cb-messages::-webkit-scrollbar { width: 6px; }
    .cb-messages::-webkit-scrollbar-track { background: transparent; }
    .cb-messages::-webkit-scrollbar-thumb { background: rgba(79,123,255,.25); border-radius: 3px; }
    .cb-messages::-webkit-scrollbar-thumb:hover { background: rgba(79,123,255,.4); }

    /* ── Empty state ── */
    .cb-empty {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      height: 100%; gap: 12px; padding: 20px;
      text-align: center;
    }
    .cb-empty__icon {
      width: 48px; height: 48px;
      border-radius: 12px; display: flex; align-items: center; justify-content: center;
      background: rgba(79,123,255,.12); border: 1px solid rgba(79,123,255,.25);
      color: var(--cb-accent);
    }
    .cb-empty__title {
      font-size: 12.5px; color: var(--cb-text-muted);
      margin: 0; line-height: 1.6; max-width: 240px;
    }

    /* ── Bubbles ── */
    .cb-bubble-wrap {
      display: flex; flex-direction: column; gap: 4px;
      animation: bubbleIn .24s cubic-bezier(.34,.1,.64,.99);
    }
    @keyframes bubbleIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .cb-bubble-wrap--user { align-items: flex-end; }
    .cb-bubble-wrap--ai { align-items: flex-start; }
    .cb-bubble {
      max-width: 86%; padding: 11px 14px;
      border-radius: 14px; font-size: 13.5px; line-height: 1.6;
      word-break: break-word;
    }
    .cb-bubble--user {
      background: var(--cb-user-bg); color: #fff;
      border-bottom-right-radius: 4px;
      box-shadow: 0 4px 16px rgba(79,123,255,.35);
      font-weight: 500;
    }
    .cb-bubble--ai {
      background: var(--cb-ai-bg); color: var(--cb-text);
      border: 1px solid var(--cb-border); border-bottom-left-radius: 4px;
    }
    .cb-bubble__text {
      margin: 0; white-space: pre-wrap; word-break: break-word;
      font-family: inherit; font-size: inherit; line-height: inherit;
    }
    .cb-bubble__label {
      font-size: 10px; font-weight: 700; color: var(--cb-text-muted);
      letter-spacing: .06em; text-transform: uppercase; padding: 0 4px;
    }

    /* ── Typing animation ── */
    .cb-bubble--typing {
      display: flex; gap: 6px; align-items: center; padding: 14px 16px;
    }
    .cb-bubble--typing span {
      width: 6px; height: 6px; border-radius: 50%;
      animation: typingBounce 1.3s infinite ease-in-out;
    }
    .cb-bubble--typing span:nth-child(1) { animation-delay: 0s; background: var(--cb-accent); }
    .cb-bubble--typing span:nth-child(2) { animation-delay: .18s; background: var(--cb-accent-2); }
    .cb-bubble--typing span:nth-child(3) { animation-delay: .36s; background: var(--cb-accent-3); }
    @keyframes typingBounce {
      0%, 80%, 100% { transform: translateY(0) scale(.8); opacity: .5; }
      40% { transform: translateY(-7px) scale(1); opacity: 1; }
    }

    /* ── Loading label ── */
    .cb-loading-label {
      font-size: 10.5px; color: var(--cb-text-muted);
      text-align: left; margin: -2px 0 0 4px;
      font-style: italic; letter-spacing: .02em;
      animation: fadeIn .3s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    /* ── Error state ── */
    .cb-error {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 12px 13px; border-radius: 10px;
      background: rgba(255,77,109,.11);
      border: 1.5px solid rgba(255,77,109,.3);
      animation: fadeIn .25s ease;
    }
    .cb-error__icon {
      color: var(--cb-danger); flex-shrink: 0; margin-top: 1px;
    }
    .cb-error__content {
      display: flex; flex-direction: column; gap: 8px; flex: 1;
    }
    .cb-error__text {
      font-size: 12.5px; color: var(--cb-danger); line-height: 1.5;
      margin: 0; opacity: .9;
    }
    .cb-retry-btn {
      align-self: flex-start;
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 12px;
      font-size: 11.5px; font-weight: 600; font-family: inherit;
      color: #fff; background: var(--cb-danger);
      border: none; border-radius: 8px; cursor: pointer;
      transition: all .15s ease;
    }
    .cb-retry-btn:hover:not(:disabled) {
      background: #dd2a3f;
      box-shadow: 0 4px 12px rgba(255,77,109,.3);
      transform: translateY(-1px);
    }
    .cb-retry-btn:active:not(:disabled) { transform: translateY(0); }
    .cb-retry-btn:disabled { opacity: .5; cursor: not-allowed; }

    /* ── Input area ── */
    .cb-input-area {
      padding: 10px 12px 8px;
      border-top: 1px solid var(--cb-border);
      background: rgba(79,123,255,.02); flex-shrink: 0;
    }
    .cb-input-wrap {
      display: flex; align-items: flex-end; gap: 8px;
      background: rgba(79,123,255,.06);
      border: 1.5px solid var(--cb-border);
      border-radius: 12px; padding: 6px 6px 6px 12px;
      transition: all .18s ease;
    }
    .cb-input-wrap:focus-within {
      border-color: var(--cb-accent);
      background: rgba(79,123,255,.1);
      box-shadow: 0 0 0 3px rgba(79,123,255,.08);
    }
    .cb-input {
      flex: 1; resize: none; border: none;
      background: transparent; color: var(--cb-text);
      font-size: 13.5px; font-family: inherit; outline: none;
      max-height: 110px; overflow-y: auto; line-height: 1.5; padding: 3px 0;
      scrollbar-width: thin; scrollbar-color: rgba(79,123,255,.2) transparent;
    }
    .cb-input::placeholder { color: var(--cb-text-muted); opacity: .7; }
    .cb-input:disabled { opacity: .4; }
    .cb-send {
      width: 36px; height: 36px; border-radius: 10px;
      background: var(--cb-accent);
      color: #fff; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      transition: all .15s ease;
      box-shadow: 0 4px 12px rgba(79,123,255,.35);
    }
    .cb-send:hover:not(:disabled) {
      background: var(--cb-accent-2);
      box-shadow: 0 6px 18px rgba(79,123,255,.5);
      transform: translateY(-2px);
    }
    .cb-send:active:not(:disabled) { transform: translateY(-1px); }
    .cb-send:disabled { opacity: .35; cursor: not-allowed; }
    .cb-input-hint {
      font-size: 10px; color: var(--cb-text-muted);
      margin: 5px 0 0; text-align: center; letter-spacing: .01em;
    }
    .cb-input-hint kbd {
      padding: 1px 4px; background: rgba(79,123,255,.15);
      border: 1px solid var(--cb-border); border-radius: 3px;
      font-family: monospace; font-size: 9px; color: var(--cb-accent);
    }
  `]
})
export class ChatbotComponent implements AfterViewChecked {
  vm = inject(ChatbotViewModel);

  @ViewChild('scrollRef') scrollRef!: ElementRef<HTMLDivElement>;
  @ViewChild('inputRef')  inputRef!:  ElementRef<HTMLTextAreaElement>;

  open      = signal(false);
  inputText = '';

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      const el = this.scrollRef?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  onEnter(e: Event): void {
    const ke = e as KeyboardEvent;
    if (!ke.shiftKey) {
      e.preventDefault();
      this.submit();
    }
  }

  async submit(): Promise<void> {
    const text = this.inputText.trim();
    if (!text) return;
    this.inputText = '';
    await this.vm.send(text);
  }

}
