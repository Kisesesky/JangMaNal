import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

export class SocialLoginDto {
  @IsIn(['google', 'naver', 'kakao'])
  provider!: 'google' | 'naver' | 'kakao';

  @IsString()
  providerUserId!: string;

  @IsEmail()
  email!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  profileImageUrl?: string;
}
