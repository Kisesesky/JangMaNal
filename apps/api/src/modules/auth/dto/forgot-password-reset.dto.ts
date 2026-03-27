import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class ForgotPasswordResetDto {
  @ApiProperty({ type: String, description: '이메일' })
  @IsEmail()
  email!: string;

  @ApiProperty({ type: String, description: '새 비밀번호' })
  @IsString()
  @MinLength(8)
  newPassword!: string;

  @ApiProperty({ type: String, description: '새 비밀번호 확인' })
  @IsString()
  @MinLength(8)
  newPasswordConfirm!: string;
}
