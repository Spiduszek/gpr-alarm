export interface User {
  id: number;
  login: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  active: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}