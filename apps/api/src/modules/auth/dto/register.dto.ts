import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ type: String, description: '프로필 이미지 URL' })
  @IsOptional()
  @IsString()
  profileImageUrl?: string;

  @ApiProperty({ type: String, description: '이메일' })
  @IsEmail()
  email!: string;

  @ApiProperty({ type: String, description: '이름' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ type: String, description: '전화번호' })
  @Matches(/^\\+?[0-9-]{9,15}$/)
  phoneNumber!: string;

  @ApiProperty({ type: String, description: '비밀번호' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ type: String, description: '비밀번호 확인' })
  @IsString()
  @MinLength(8)
  passwordConfirm!: string;

  @ApiProperty({ type: Boolean, description: '이용약관 동의' })
  @IsBoolean()
  agreeTerms!: boolean;

  @ApiProperty({ type: Boolean, description: '개인정보처리방침 동의' })
  @IsBoolean()
  agreePrivacy!: boolean;
}
