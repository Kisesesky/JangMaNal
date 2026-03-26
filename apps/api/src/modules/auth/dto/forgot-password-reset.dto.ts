import { IsEmail, IsString, MinLength } from 'class-validator';

export class ForgotPasswordResetDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;

  @IsString()
  @MinLength(8)
  newPasswordConfirm!: string;
}
