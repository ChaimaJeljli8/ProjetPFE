import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';
import { LanguageService } from '../../shared/services/language.service';
import { ThemeService } from '../../shared/services/theme.service';
import { UserApiService } from '../../shared/services/user-api.service';
import { SIDEBAR_STYLES } from '../../shared/styles/sidebar.styles';
import { ChatbotComponent } from '../planner-chat/chatbot.component';

@Component({
  selector: 'app-planner-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, ChatbotComponent],
  template: `
    <div class="shell">
      <aside class="sidebar" [class.collapsed]="collapsed">

        <div class="sidebar-logo">
          <div class="logo-icon">
            <img src="/logo app.png" alt="Logo" width="20" height="20"/>
          </div>
          <span class="sidebar-app-name" *ngIf="!collapsed">DenimPlanner</span>
          <button class="collapse-btn" (click)="collapsed = !collapsed"
                  [title]="collapsed ? t().expandSidebar : t().collapseSidebar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path *ngIf="!collapsed" d="M15 18l-6-6 6-6"/>
              <path *ngIf="collapsed"  d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>

        <div class="role-pill" *ngIf="!collapsed">
          <span class="role-dot planner"></span>
          {{ t().plannerRoleLabel }}
        </div>

        <nav class="sidebar-nav">

          <!-- ── Vue d'ensemble ── -->
          <span class="nav-section-label" *ngIf="!collapsed">{{ t().sectionOverview }}</span>

          <!-- Dashboard KPI -->
          <a routerLink="/planner" routerLinkActive="active"
             [routerLinkActiveOptions]="{ exact: true }" class="nav-link"
             [title]="collapsed ? t().dashboardNav : ''">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span *ngIf="!collapsed">{{ t().dashboardNav }}</span>
          </a>

          <!-- Planification -->
          <a routerLink="/planner/planification" routerLinkActive="active" class="nav-link"
             [title]="collapsed ? t().adminPlanificationNav : ''">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="17" rx="2"/>
              <path d="M3 9h18M8 2v4M16 2v4M7 13h3M7 17h5"/>
            </svg>
            <span *ngIf="!collapsed">{{ t().adminPlanificationNav }}</span>
          </a>

          <!-- ── Gestion ── -->
          <span class="nav-section-label" *ngIf="!collapsed">{{ t().sectionGestion }}</span>

          <!-- Commandes -->
          <a routerLink="/planner/commandes" routerLinkActive="active" class="nav-link"
             [title]="collapsed ? t().commandesNav : ''">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <span *ngIf="!collapsed">{{ t().commandesNav }}</span>
          </a>

          <!-- Recettes -->
          <a routerLink="/planner/recettes" routerLinkActive="active" class="nav-link"
             [title]="collapsed ? t().recettesNav : ''">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            <span *ngIf="!collapsed">{{ t().recettesNav }}</span>
          </a>

          <!-- Machines -->
          <a routerLink="/planner/machines" routerLinkActive="active" class="nav-link"
             [title]="collapsed ? t().machinesNav : ''">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M8 21h8M12 17v4"/>
              <circle cx="12" cy="10" r="3"/>
              <path d="M12 7v1M12 12v1M9 10h1M14 10h1"/>
            </svg>
            <span *ngIf="!collapsed">{{ t().machinesNav }}</span>
          </a>

        </nav>

        <div class="sidebar-bottom">
          <div class="user-info" *ngIf="!collapsed">
            <div class="user-avatar">
              <img *ngIf="auth.currentUser()?.profilePhoto" [src]="auth.currentUser()!.profilePhoto!" alt=""/>
              <span *ngIf="!auth.currentUser()?.profilePhoto">
                {{ auth.currentUser()?.firstName?.charAt(0) }}{{ auth.currentUser()?.lastName?.charAt(0) }}
              </span>
            </div>
            <div class="user-details">
              <span class="user-name">{{ auth.currentUser()?.firstName }} {{ auth.currentUser()?.lastName }}</span>
              <span class="user-email">{{ auth.currentUser()?.email }}</span>
            </div>
          </div>

          <a routerLink="/profile" class="nav-link" [title]="collapsed ? t().myProfile : ''">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span *ngIf="!collapsed">{{ t().myProfile }}</span>
          </a>

          <button class="nav-link" (click)="theme.toggle()"
                  [title]="collapsed ? (theme.theme() === 'light' ? t().darkMode : t().lightMode) : ''">
            <svg *ngIf="theme.theme() === 'light'" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <svg *ngIf="theme.theme() === 'dark'" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            <span *ngIf="!collapsed">{{ theme.theme() === 'light' ? t().darkMode : t().lightMode }}</span>
          </button>

          <button class="nav-link nav-logout" (click)="auth.logout()"
                  [title]="collapsed ? t().logout : ''">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span *ngIf="!collapsed">{{ t().logout }}</span>
          </button>
        </div>
      </aside>

      <main class="shell-main">
        <router-outlet/>
      </main>
      <app-chatbot></app-chatbot>
    </div>
  `,
  styles: [SIDEBAR_STYLES]
})
export class PlannerShellComponent implements OnInit {
  auth      = inject(AuthService);
  theme     = inject(ThemeService);
  t         = inject(LanguageService).t;
  collapsed = false;

  private userApi = inject(UserApiService);

  async ngOnInit(): Promise<void> {
    const data = await this.userApi.getMyProfile();
    if (data) {
      const current = this.auth.currentUser();
      if (current) {
        this.auth.currentUser.set({
          ...current,
          firstName:    data.firstName,
          lastName:     data.lastName,
          profilePhoto: data.profilePhoto ?? null,
        });
        this.auth.persistCurrentUser();
      }
    }
  }
}
