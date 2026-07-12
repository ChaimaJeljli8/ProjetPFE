import { Injectable, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { UserApiService, UserRecord } from '../../shared/services/user-api.service';
import { LanguageService } from '../../shared/services/language.service';


function passwordMatch(ctrl: AbstractControl) {
  const p = ctrl.get('password')?.value;
  const c = ctrl.get('confirmPassword')?.value;
  return !p || p === c ? null : { mismatch: true };
}

export type ModalMode = 'create' | 'edit' | null;

@Injectable()
export class AdminUsersViewModel {
  private api  = inject(UserApiService);
  private fb   = inject(FormBuilder);
  private lang = inject(LanguageService);

  users       = signal<UserRecord[]>([]);
  isLoading   = this.api.isLoading.asReadonly();
  error       = this.api.error.asReadonly();
  modalMode   = signal<ModalMode>(null);
  editingId   = signal<string | null>(null);
  searchQuery = signal('');
  toast       = signal<{ msg: string; type: 'success' | 'error' } | null>(null);
  confirmDeleteId = signal<string | null>(null);

  private readonly roleAliases: Record<string, string[]> = {
    Admin: [
      'admin',
      'administrateur',
      'administratrice',
    ],
    PlanificationResponsable: [
      'planification',
      'responsable',
      'planificationresponsable',
      'responsable planification',
      'planification responsable',
      'resp planification',
    ],
    Worker: [
      'worker',
      'travailleur',
      'travailleuse',
    ],
  };

  filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.users();

    return this.users().filter(u => {
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      const aliases  = this.roleAliases[u.role] ?? [u.role.toLowerCase()];

      return (
        fullName.includes(q)                  ||
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q)  ||
        u.email.toLowerCase().includes(q)     ||
        aliases.some(a => a.includes(q))
      );
    });
  });

  form: FormGroup = this.fb.group({
    firstName:       ['', Validators.required],
    lastName:        ['', Validators.required],
    email:           ['', [Validators.required, Validators.email]],
    role:            ['Worker', Validators.required],
    isActive:        [true],
    password:        [''],
    confirmPassword: [''],
  }, { validators: passwordMatch });

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  async load(): Promise<void> {
    const data = await this.api.getAllUsers();
    if (data) this.users.set(data);
  }

  // ── Modal
  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ role: 'Worker', isActive: true });
    // Password required on create
    this.form.get('password')!.setValidators([Validators.required, Validators.minLength(8)]);
    this.form.get('confirmPassword')!.setValidators([Validators.required]);
    this.form.get('password')!.updateValueAndValidity();
    this.form.get('confirmPassword')!.updateValueAndValidity();
    this.modalMode.set('create');
  }

  openEdit(user: UserRecord): void {
    this.editingId.set(user.id);
    this.form.reset({
      firstName: user.firstName,
      lastName:  user.lastName,
      email:     user.email,
      role:      user.role,
      isActive:  user.isActive,
      password:  '',
      confirmPassword: '',
    });

    this.form.get('password')!.clearValidators();
    this.form.get('confirmPassword')!.clearValidators();
    this.form.get('password')!.updateValueAndValidity();
    this.form.get('confirmPassword')!.updateValueAndValidity();
    this.modalMode.set('edit');
  }

  closeModal(): void { this.modalMode.set(null); }

  // ── Submit
  async submit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value;

    let ok: unknown;
    if (this.modalMode() === 'create') {
      ok = await this.api.createUser({
        firstName: v.firstName, lastName: v.lastName,
        email: v.email, password: v.password, role: v.role,
      });
    } else {
      ok = await this.api.updateUser(this.editingId()!, {
        firstName: v.firstName, lastName: v.lastName,
        email: v.email, role: v.role, isActive: v.isActive === true || v.isActive === 'true',
      });
    }

    if (ok) {
      const t = this.lang.t();
      this.showToast(this.modalMode() === 'create' ? t.createUserTitle + ' ✓' : t.editUserTitle + ' ✓', 'success');
      this.closeModal();
      await this.load();
    }
  }

  // ── Delete
  requestDelete(id: string): void { this.confirmDeleteId.set(id); }
  cancelDelete(): void { this.confirmDeleteId.set(null); }

  async confirmDelete(): Promise<void> {
    const id = this.confirmDeleteId();
    if (!id) return;
    const ok = await this.api.deleteUser(id);
    this.confirmDeleteId.set(null);
    if (ok) { this.showToast(this.lang.t().deleteBtn + ' ✓', 'success'); await this.load(); }
  }

  // ── Reset password
  async sendReset(id: string): Promise<void> {
    const ok = await this.api.sendPasswordReset(id);
    if (ok) this.showToast('Email de réinitialisation envoyé ✓', 'success');
    else this.showToast('Échec de l\'envoi de l\'email.', 'error');
  }

  // ── Toast
  private showToast(msg: string, type: 'success' | 'error'): void {
    this.toast.set({ msg, type });
    setTimeout(() => this.toast.set(null), 3500);
  }
}
