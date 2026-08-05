export class LoginResponseDto {
  accessToken!: string;

  refreshToken!: string;

  expiresIn!: number;

  user!: {
    id: number;
    login: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}