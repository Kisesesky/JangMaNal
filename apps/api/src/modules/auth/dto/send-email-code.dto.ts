import { IsEmail, IsIn, IsOptional } from 'class-validator';

export class SendEmailCodeDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsIn(['signup', 'password_reset', 'password_change'])
  purpose?: 'signup' | 'password_reset' | 'password_change';
}
