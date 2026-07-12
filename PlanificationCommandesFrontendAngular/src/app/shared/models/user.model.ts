export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'Admin' | 'PlanificationResponsable' | 'Worker';
  profilePhoto?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}


export interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  profilePhoto?: string | null;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  profilePhoto?: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
