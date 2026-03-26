import { IsString, Length, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @Length(6, 6)
  code!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;

  @IsString()
  @MinLength(8)
  newPasswordConfirm!: string;
}
