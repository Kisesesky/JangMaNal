import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, Length } from 'class-validator';
import { VerificationPurpose } from '../constants/verification-purpost.type';

export class VerifyEmailCodeDto {
  @ApiProperty({ type: String, description: '이메일' })
  @IsEmail()
  email!: string;

  @ApiProperty({ type: String, description: '인증 목적', enum: VerificationPurpose })
  @IsEnum(VerificationPurpose)
  purpose!: VerificationPurpose;

  @ApiProperty({ type: String, description: '인증 코드' })
  @IsString()
  @Length(6, 6)
  code!: string;
}
