import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './service/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { VerificationCodeEntity } from './entities/verification-code.entity';
import { UsersModule } from 'src/modules/users/users.module';
import { MailModule } from 'src/modules/mail/mail.module';
import { SocialAccountEntity } from './entities/social-account.entity';
import { GoogleStrategy } from './strategies/google.strategy';
import { NaverStrategy } from './strategies/naver.strategy';
import { KakaoStrategy } from './strategies/kakao.strategy';
import { EnvConfigService } from 'src/config/env-config.service';
import { AppConfigModule } from 'src/config/app-config.module';

@Module({
  imports: [
    AppConfigModule,
    UsersModule,
    MailModule,
    PassportModule.register({ session: false }),
    TypeOrmModule.forFeature([VerificationCodeEntity, SocialAccountEntity]),
    JwtModule.registerAsync({
      inject: [EnvConfigService],
      useFactory: (envConfigService: EnvConfigService) => ({
        secret: envConfigService.jwtSecret,
        signOptions: { expiresIn: envConfigService.jwtExpiresIn },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    NaverStrategy,
    KakaoStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
