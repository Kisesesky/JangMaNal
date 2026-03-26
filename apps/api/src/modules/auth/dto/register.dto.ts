import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsOptional()
  @IsString()
  profileImageUrl?: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @Matches(/^\\+?[0-9-]{9,15}$/)
  phoneNumber!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(8)
  passwordConfirm!: string;

  @IsBoolean()
  agreeTerms!: boolean;

  @IsBoolean()
  agreePrivacy!: boolean;
}
