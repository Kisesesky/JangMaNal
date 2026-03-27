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
import { AuthStoreService } from './service/auth-store.service';
import { AppConfigService } from 'src/config/app/config.service';
import { AppConfigModule } from 'src/config/app/config.module';

@Module({
  imports: [
    AppConfigModule,
    UsersModule,
    MailModule,
    TypeOrmModule.forFeature([VerificationCodeEntity, SocialAccountEntity]),
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      useFactory: (appConfigService: AppConfigService) => {
        if (!appConfigService.jwtSecret || !appConfigService.jwtExpiresIn) {
          throw new Error('JWT 설정이 올바르지 않습니다.');
        }
        return {
          secret: appConfigService.jwtSecret,
          signOptions: { 
            expiresIn: appConfigService.jwtExpiresIn,
          },
        };
      },
      inject: [AppConfigService],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AuthController],
  providers: [
    AuthStoreService,
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    NaverStrategy,
    KakaoStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
