import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { SocialProvider } from '../constants/social-provider.type';

export class SocialLoginDto {
  @ApiProperty({ type: String, description: '소셜 로그인 제공자', enum: SocialProvider })
  @IsEnum(SocialProvider)
  provider!: SocialProvider;

  @ApiProperty({ type: String, description: '소셜 로그인 사용자 ID' })
  @IsString()
  providerUserId!: string;

  @ApiProperty({ type: String, description: '이메일' })
  @IsEmail()
  email!: string;

  @ApiProperty({ type: String, description: '이름' })
  @IsString()
  name!: string;

  @ApiProperty({ type: String, description: '프로필 이미지 URL' })
  @IsOptional()
  @IsString()
  profileImageUrl?: string;
}
