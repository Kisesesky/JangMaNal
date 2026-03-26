import { IsEmail, IsIn, IsString, Length } from 'class-validator';

export class VerifyEmailCodeDto {
  @IsEmail()
  email!: string;

  @IsIn(['signup', 'password_reset', 'password_change'])
  purpose!: 'signup' | 'password_reset' | 'password_change';

  @IsString()
  @Length(6, 6)
  code!: string;
}
