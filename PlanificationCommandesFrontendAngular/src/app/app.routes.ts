import { Routes } from '@angular/router';
import { LandingComponent }         from './landing/landing.component';
import { AuthLayoutComponent }      from './auth/auth-layout.component';
import { LoginComponent }           from './auth/login/login.component';
import { SignupComponent }          from './auth/signup/signup.component';
import { ForgotPasswordComponent }  from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent }   from './auth/reset-password/reset-password.component';
import { authGuard }    from './shared/guards/auth.guard';
import { adminGuard }   from './shared/guards/admin.guard';
import { plannerGuard } from './shared/guards/planner.guard';
import { workerGuard }  from './shared/guards/worker.guard';

export const routes: Routes = [
  //  Public
  { path: '', component: LandingComponent },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: '',                redirectTo: 'login', pathMatch: 'full' },
      { path: 'login',           component: LoginComponent },
      { path: 'signup',          component: SignupComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password',  component: ResetPasswordComponent },
    ],
  },

  //   Profile (any authenticated role)
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./profile/profile.component').then(m => m.ProfileComponent),
  },

  //  /worker
  {
    path: 'worker',
    canActivate: [workerGuard],
    loadComponent: () =>
      import('./worker/worker-shell/worker-shell.component')
        .then(m => m.WorkerShellComponent),
    children: [
      {
        //  KPI dashboard
        path: '',
        loadComponent: () =>
          import('./worker/worker-dashboard/worker-dashboard.component')
            .then(m => m.WorkerDashboardComponent),
      },
      {
        path: 'planning',
        loadComponent: () =>
          import('./worker/worker-planning/worker-planning.component')
            .then(m => m.WorkerPlanningComponent),
      },
    ],
  },

  // /planner
  {
    path: 'planner',
    canActivate: [plannerGuard],
    loadComponent: () =>
      import('./planner/planner-shell/planner-shell.component')
        .then(m => m.PlannerShellComponent),
    children: [
      {
        //  KPI dashboard
        path: '',
        loadComponent: () =>
          import('./planner/planner-dashboard/planner-dashboard.component')
            .then(m => m.PlannerDashboardComponent),
      },
      {
        path: 'commandes',
        loadComponent: () =>
          import('./planner/commandes/commande.component')
            .then(m => m.CommandeComponent),
      },
      {
        path: 'recettes',
        loadComponent: () =>
          import('./planner/recettes/recette.component')
            .then(m => m.RecetteComponent),
      },
      {
        path: 'machines',
        loadComponent: () =>
          import('./admin/machines/machine.component')
            .then(m => m.MachineComponent),
      },
      {
        path: 'planification',
        loadComponent: () =>
          import('./planner/Planification/planning.component')
            .then(m => m.PlannerPlanningComponent),
      },
    ],
  },

  //  /admin
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./admin/admin-shell/admin-shell.component')
        .then(m => m.AdminShellComponent),
    children: [
      {
        //  KPI dashboard
        path: '',
        loadComponent: () =>
          import('./admin/admin-dashboard/admin-dashboard.component')
            .then(m => m.AdminDashboardComponent),
      },
      {
        path: 'planning',
        loadComponent: () =>
          import('./admin/admin-planning/admin-planning.component')
            .then(m => m.AdminPlanningComponent),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./admin/users/admin-users.component')
            .then(m => m.AdminUsersComponent),
      },
      {
        path: 'machines',
        loadComponent: () =>
          import('./admin/machines/machine.component')
            .then(m => m.MachineComponent),
      },
      {
        path: 'commandes',
        loadComponent: () =>
          import('./planner/commandes/commande.component')
            .then(m => m.CommandeComponent),
      },
      {
        path: 'recettes',
        loadComponent: () =>
          import('./planner/recettes/recette.component')
            .then(m => m.RecetteComponent),
      },
    ],
  },

  //  Legacy redirects
  { path: 'machines',  redirectTo: '/admin/machines',        pathMatch: 'full' },
  { path: 'commandes', redirectTo: '/planner/commandes',     pathMatch: 'full' },
  { path: 'recettes',  redirectTo: '/planner/recettes',      pathMatch: 'full' },
  { path: 'planning',  redirectTo: '/planner/planification', pathMatch: 'full' },

  { path: '**', redirectTo: '' },
];
