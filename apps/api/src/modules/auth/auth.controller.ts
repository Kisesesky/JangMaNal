import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './service/auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { SendEmailCodeDto } from './dto/send-email-code.dto';
import { VerifyEmailCodeDto } from './dto/verify-email-code.dto';
import { ForgotPasswordRequestDto } from './dto/forgot-password-request.dto';
import { ForgotPasswordVerifyDto } from './dto/forgot-password-verify.dto';
import { ForgotPasswordResetDto } from './dto/forgot-password-reset.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RequestUser } from '../../common/decorators/request-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { NaverAuthGuard } from './guards/naver-auth.guard';
import { KakaoAuthGuard } from './guards/kakao-auth.guard';
import type { OAuthProfile } from './type/oauth-profile.type';
import { RequestOrigin } from '../../common/decorators/request.origin';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup/email/send-code')
  @ApiOperation({ summary: '회원가입 이메일 인증코드 발송' })
  sendSignupCode(@Body() dto: SendEmailCodeDto) {
    return this.authService.sendEmailCode(dto.email, dto.purpose || 'signup');
  }

  @Post('signup/email/verify')
  @ApiOperation({ summary: '회원가입 이메일 인증코드 확인' })
  verifySignupCode(@Body() dto: VerifyEmailCodeDto) {
    return this.authService.verifyEmailCode(dto.email, dto.purpose, dto.code);
  }

  @Post('signup')
  @ApiOperation({ summary: '회원가입' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: '이메일/비밀번호 로그인' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('social/login')
  @ApiOperation({ summary: '소셜 로그인 API (앱 직접 처리용)' })
  socialLogin(@Body() dto: SocialLoginDto) {
    return this.authService.socialLogin(dto);
  }

  @Get('social/google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth 시작' })
  googleLogin() {
    return;
  }

  @Get('social/google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth 콜백' })
  async googleCallback(
    @RequestUser() profile: OAuthProfile,
    @RequestOrigin() origin: string,
    @Res() res: Response,
  ) {
    const result = await this.authService.socialLoginFromOAuth(profile);
    return res.redirect(`${origin}/login/callback?token=${result.accessToken}`);
  }

  @Get('social/naver')
  @UseGuards(NaverAuthGuard)
  @ApiOperation({ summary: 'Naver OAuth 시작' })
  naverLogin() {
    return;
  }

  @Get('social/naver/callback')
  @UseGuards(NaverAuthGuard)
  @ApiOperation({ summary: 'Naver OAuth 콜백' })
  async naverCallback(
    @RequestUser() profile: OAuthProfile,
    @RequestOrigin() origin: string,
    @Res() res: Response,
  ) {
    const result = await this.authService.socialLoginFromOAuth(profile);
    return res.redirect(`${origin}/login/callback?token=${result.accessToken}`);
  }

  @Get('social/kakao')
  @UseGuards(KakaoAuthGuard)
  @ApiOperation({ summary: 'Kakao OAuth 시작' })
  kakaoLogin() {
    return;
  }

  @Get('social/kakao/callback')
  @UseGuards(KakaoAuthGuard)
  @ApiOperation({ summary: 'Kakao OAuth 콜백' })
  async kakaoCallback(
    @RequestUser() profile: OAuthProfile,
    @RequestOrigin() origin: string,
    @Res() res: Response,
  ) {
    const result = await this.authService.socialLoginFromOAuth(profile);
    return res.redirect(`${origin}/login/callback?token=${result.accessToken}`);
  }

  @Post('password/forgot/request')
  @ApiOperation({ summary: '비밀번호 찾기 1단계: 이메일 인증코드 발송' })
  forgotPasswordRequest(@Body() dto: ForgotPasswordRequestDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Post('password/forgot/verify')
  @ApiOperation({ summary: '비밀번호 찾기 1단계: 인증코드 검증' })
  forgotPasswordVerify(@Body() dto: ForgotPasswordVerifyDto) {
    return this.authService.verifyEmailCode(
      dto.email,
      'password_reset',
      dto.code,
    );
  }

  @Post('password/forgot/reset')
  @ApiOperation({ summary: '비밀번호 찾기 2단계: 새 비밀번호 재설정' })
  forgotPasswordReset(@Body() dto: ForgotPasswordResetDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('password/change/request')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '비밀번호 변경용 이메일 코드 발송' })
  changePasswordRequest(@RequestUser('sub') userId: string) {
    return this.authService.requestPasswordChange(userId);
  }

  @Post('password/change')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '이메일 코드 확인 후 비밀번호 변경' })
  changePassword(
    @RequestUser('sub') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, dto);
  }
}
