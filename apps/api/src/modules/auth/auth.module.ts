import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    MailModule,
    PassportModule.register({ session: false }),
    TypeOrmModule.forFeature([VerificationCodeEntity, SocialAccountEntity]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'jangmanal-dev-secret'),
        signOptions: { expiresIn: '1d' },
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
