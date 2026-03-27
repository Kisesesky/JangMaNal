import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { VerificationPurpose } from '../constants/verification-purpost.type';

export class SendEmailCodeDto {
  @ApiProperty({ type: String, description: '이메일' })
  @IsEmail()
  email!: string;

  @ApiProperty({ type: String, description: '인증 목적', enum: VerificationPurpose })
  @IsOptional()
  @IsEnum(VerificationPurpose)
  purpose?: VerificationPurpose;
}
