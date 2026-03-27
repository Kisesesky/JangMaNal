import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ type: String, description: '이메일' })
  @IsEmail()
  email!: string;

  @ApiProperty({ type: String, description: '비밀번호' })
  @IsString()
  @MinLength(8)
  password!: string;
}
