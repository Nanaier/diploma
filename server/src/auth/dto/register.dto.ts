export class RegisterDto {
  email: string;
  password: string;
  displayName: string;
  role?: 'user' | 'psychologist';
}
