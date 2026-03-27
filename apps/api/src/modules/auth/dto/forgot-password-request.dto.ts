import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordRequestDto {
  @ApiProperty({ type: String, description: '이메일' })
  @IsEmail()
  email!: string;
}
