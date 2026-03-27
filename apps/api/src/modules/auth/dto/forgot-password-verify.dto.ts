import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class ForgotPasswordVerifyDto {
  @ApiProperty({ type: String, description: '이메일' })
  @IsEmail()
  email!: string;

  @ApiProperty({ type: String, description: '인증 코드' })
  @IsString()
  @Length(6, 6)
  code!: string;
}
