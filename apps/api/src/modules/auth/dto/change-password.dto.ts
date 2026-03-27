import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ type: String, description: '인증 코드' })
  @IsString()
  @Length(6, 6)
  code!: string;

  @ApiProperty({ type: String, description: '새 비밀번호' })
  @IsString()
  @MinLength(8)
  newPassword!: string;

  @ApiProperty({ type: String, description: '새 비밀번호 확인' })
  @IsString()
  @MinLength(8)
  newPasswordConfirm!: string;
}
