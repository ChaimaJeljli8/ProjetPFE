import { Injectable, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserApiService } from '../shared/services/user-api.service';
import { AuthService } from '../shared/services/auth.service';
import { LanguageService } from '../shared/services/language.service';

function passwordMatch(ctrl: AbstractControl) {
  const p = ctrl.get('newPassword')?.value;
  const c = ctrl.get('confirmPassword')?.value;
  return p === c ? null : { mismatch: true };
}

@Injectable()
export class ProfileViewModel {
  private api  = inject(UserApiService);
  private auth = inject(AuthService);
  private fb   = inject(FormBuilder);
  private lang = inject(LanguageService);


  isLoading   = this.api.isLoading.asReadonly();
  currentUser = this.auth.currentUser.asReadonly();

  toast     = signal<{ msg: string; type: 'success' | 'error' } | null>(null);
  showPwd   = signal(false);
  activeTab = signal<'info' | 'password'>('info');

  // Photo state
  photoPreview  = signal<string | null>(null);  // data URI shown in UI
  photoChanged  = signal(false);                // whether user touched the photo
  photoRemoved  = signal(false);                // whether user explicitly removed it
  isDragging    = signal(false);

  //  Info form (firstName + lastName only — no email)
  profileForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
  });

  //  Change password form
  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword:     ['', [Validators.required, Validators.minLength(8),
                           Validators.pattern(/(?=.*[A-Z])(?=.*\d)/)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordMatch });

  isInvalid(form: FormGroup, field: string): boolean {
    const c = form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  get strength(): number {
    const p: string = this.passwordForm.get('newPassword')?.value || '';
    let s = 0;
    if (p.length >= 8) s++; // Longueur >= 8 caractères
    if (/[A-Z]/.test(p) && /\d/.test(p)) s++; // Contient une majuscule et un chiffre
    if (/[^A-Za-z0-9]/.test(p)) s++;  // Contient un caractère spécial
    return s;
  }
// Retourne le libellé correspondant au niveau de robustesse du mot de passe 0= vide, 1=faible, 2=moyen, 3=fort
  get strengthLabel(): string { return ['', 'Faible', 'Moyen', 'Fort'][this.strength] || ''; }

  // Charge les informations du profil depuis le backend
  async load(): Promise<void> {
    const data = await this.api.getMyProfile();
    if (data) {
      this.profileForm.patchValue({ firstName: data.firstName, lastName: data.lastName });
      this.photoPreview.set(data.profilePhoto ?? null);

      // Sync fresh profile data into the auth signal and persist to storage
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

  // Traite et valide l'image sélectionnée par l'utilisateur

  handleFileSelect(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.showToast('Fichier invalide. Veuillez choisir une image (JPG, PNG, WEBP).', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.showToast('La photo ne doit pas dépasser 2 Mo.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      this.photoPreview.set(dataUri);
      this.photoChanged.set(true);
      this.photoRemoved.set(false);
    };
    reader.readAsDataURL(file); // Convertit l'image en Data URL pour l'aperçu
  }
// Récupère le fichier choisi via le champ input
  onFileInputChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.handleFileSelect(file);
  }
// Gère le dépôt d'une image par glisser-déposer
  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) this.handleFileSelect(file);
  }
// Supprime la photo de profil actuellement affichée
  removePhoto(): void {
    this.photoPreview.set(null);
    this.photoChanged.set(true);
    this.photoRemoved.set(true);
  }

 // Enregistre les modifications du profil utilisateur
  async submitProfile(): Promise<void> {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }

    const payload: { firstName: string; lastName: string; profilePhoto?: string | null } = {
      firstName: this.profileForm.value.firstName,
      lastName:  this.profileForm.value.lastName,
    };

    // Envoie la photo uniquement si elle a été modifiée
    if (this.photoChanged()) {
      payload.profilePhoto = this.photoRemoved() ? '' : (this.photoPreview() ?? undefined);
    }

    const ok = await this.api.updateProfile(payload);
    if (ok) {
      // Update the local auth signal so the avatar in the nav updates instantly
      const current = this.auth.currentUser();
      if (current) {
        this.auth.currentUser.set({
          ...current,
          firstName: payload.firstName,
          lastName:  payload.lastName,
          profilePhoto: this.photoRemoved()
            ? null
            : (this.photoChanged() ? (this.photoPreview() ?? current.profilePhoto) : current.profilePhoto),
        });
        this.auth.persistCurrentUser(); // Met à jour les informations du profil dans le stockage local
      }
      this.photoChanged.set(false);
      this.photoRemoved.set(false);
      this.showToast('Profil mis à jour avec succès.', 'success');
    } else {
      this.showToast(this.api.error() ?? 'Erreur lors de la mise à jour.', 'error');
    }
  }

  // Modifie le mot de passe de l'utilisateur
  async submitPassword(): Promise<void> {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    const { currentPassword, newPassword } = this.passwordForm.value;
    const ok = await this.api.changePassword({ currentPassword, newPassword });
    if (ok) {
      this.passwordForm.reset();
      this.showToast('Mot de passe modifié avec succès.', 'success');
    } else {
      this.showToast(this.api.error() ?? 'Erreur.', 'error');
      this.showToast(this.lang.t().incorrectPassword, 'error');
    }
  }
 // Affiche ou masque le mot de passe
  togglePwd(): void { this.showPwd.update(v => !v); }

  private showToast(msg: string, type: 'success' | 'error'): void {
    this.toast.set({ msg, type });
    setTimeout(() => this.toast.set(null), 3500);
  }
}
