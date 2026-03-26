import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { SocialLoginDto } from '../dto/social-login.dto';
import { VerificationPurpose } from '../entities/verification-code.entity';
import { AUTH_CONSTANTS } from '../constants/auth.constants';
import { hashPassword, verifyPassword } from '../utils/password.util';
import { generateNumericCode } from 'src/modules/mail/utils/random-code.util';
import { MailService } from 'src/modules/mail/service/mail.service';
import { ForgotPasswordResetDto } from '../dto/forgot-password-reset.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { UsersService } from 'src/modules/users/service/users.service';
import { DEFAULT_PROFILE_IMAGE } from 'src/modules/users/constants/default-profile-image.constant';
import { OAuthProfile } from '../type/oauth-profile.type';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { AuthStoreService } from './auth-store.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly authStoreService: AuthStoreService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  private signToken(user: UserEntity): string {
    return this.jwtService.sign({ sub: user.id, email: user.email });
  }

  private buildAuthResult(user: UserEntity) {
    return {
      accessToken: this.signToken(user),
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  async sendEmailCode(
    email: string,
    purpose: VerificationPurpose,
  ): Promise<{ sent: boolean }> {
    const code = generateNumericCode(AUTH_CONSTANTS.emailCodeLength);
    const expiresAt = new Date(
      Date.now() + AUTH_CONSTANTS.emailCodeExpireMinutes * 60 * 1000,
    );

    await this.authStoreService.createVerificationCode({
      email,
      purpose,
      code,
      expiresAt,
    });

    await this.mailService.sendEmailCode(email, code, purpose);
    return { sent: true };
  }

  async verifyEmailCode(
    email: string,
    purpose: VerificationPurpose,
    code: string,
  ): Promise<{ verified: boolean }> {
    const row = await this.authStoreService.findVerificationCode({
      email,
      purpose,
      code,
    });

    if (!row || row.expiresAt < new Date()) {
      throw new BadRequestException(
        '인증 코드가 유효하지 않거나 만료되었습니다.',
      );
    }

    await this.authStoreService.markVerificationCodeVerified(row);

    if (purpose === 'signup') {
      await this.usersService.markEmailVerifiedByEmail({ email });
    }

    return { verified: true };
  }

  private async assertVerified(
    email: string,
    purpose: VerificationPurpose,
  ): Promise<void> {
    const row = await this.authStoreService.findVerifiedCode({
      email,
      purpose,
    });

    if (!row || row.expiresAt < new Date()) {
      throw new BadRequestException('이메일 인증이 필요합니다.');
    }
  }

  async register(dto: RegisterDto) {
    if (!dto.agreeTerms || !dto.agreePrivacy) {
      throw new BadRequestException('약관/개인정보 동의가 필요합니다.');
    }
    if (dto.password !== dto.passwordConfirm) {
      throw new BadRequestException('비밀번호 확인이 일치하지 않습니다.');
    }

    await this.assertVerified(dto.email, 'signup');

    const exists = await this.usersService.findByEmail({ email: dto.email });
    if (exists) {
      throw new BadRequestException('이미 가입된 이메일입니다.');
    }

    const saved = await this.usersService.createLocalUser({
      email: dto.email,
      name: dto.name,
      phoneNumber: dto.phoneNumber,
      profileImageUrl: dto.profileImageUrl || DEFAULT_PROFILE_IMAGE,
      passwordHash: await hashPassword(dto.password),
    });

    return this.buildAuthResult(saved);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail({ email: dto.email });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    const ok = await verifyPassword(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    return this.buildAuthResult(user);
  }

  async socialLogin(dto: SocialLoginDto) {
    const socialAccount = await this.authStoreService.findSocialAccount({
      provider: dto.provider,
      providerUserId: dto.providerUserId,
    });

    let user: UserEntity;

    if (socialAccount) {
      user = socialAccount.user;
    } else {
      user =
        (await this.usersService.findByEmail({ email: dto.email })) ||
        (await this.usersService.createSocialUser({
          email: dto.email,
          name: dto.name,
          profileImageUrl: dto.profileImageUrl || DEFAULT_PROFILE_IMAGE,
        }));

      await this.authStoreService.createSocialAccount({
        provider: dto.provider,
        providerUserId: dto.providerUserId,
        userId: user.id,
      });
    }

    return this.buildAuthResult(user);
  }

  socialLoginFromOAuth(profile: OAuthProfile) {
    return this.socialLogin({
      provider: profile.provider,
      providerUserId: profile.providerUserId,
      email: profile.email,
      name: profile.name,
      profileImageUrl: profile.profileImageUrl,
    });
  }

  async requestPasswordReset(email: string) {
    return this.sendEmailCode(email, 'password_reset');
  }

  async resetPassword(dto: ForgotPasswordResetDto) {
    if (dto.newPassword !== dto.newPasswordConfirm) {
      throw new BadRequestException('새 비밀번호 확인이 일치하지 않습니다.');
    }
    await this.assertVerified(dto.email, 'password_reset');

    const user = await this.usersService.findByEmail({ email: dto.email });
    if (!user) {
      throw new BadRequestException('가입된 이메일이 아닙니다.');
    }

    await this.usersService.updatePassword({
      userId: user.id,
      passwordHash: await hashPassword(dto.newPassword),
    });
    return { changed: true };
  }

  async requestPasswordChange(userId: string) {
    const user = await this.usersService.getById(userId);
    await this.sendEmailCode(user.email, 'password_change');
    return { sent: true };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    if (dto.newPassword !== dto.newPasswordConfirm) {
      throw new BadRequestException('새 비밀번호 확인이 일치하지 않습니다.');
    }

    const user = await this.usersService.getById(userId);
    await this.verifyEmailCode(user.email, 'password_change', dto.code);

    await this.usersService.updatePassword({
      userId,
      passwordHash: await hashPassword(dto.newPassword),
    });

    return {
      changed: true,
      forceLogout: true,
      redirectTo: '/login',
    };
  }
}
