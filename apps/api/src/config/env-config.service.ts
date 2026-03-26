import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';

type OAuthProvider = 'google' | 'naver' | 'kakao';

@Injectable()
export class EnvConfigService {
  constructor(private readonly configService: ConfigService) {}

  get appPort(): number {
    return this.configService.get<number>('app.port', 3000);
  }

  get frontendBaseUrl(): string {
    return this.configService.get<string>(
      'app.frontendBaseUrl',
      'http://localhost:3000',
    );
  }

  get db() {
    return {
      host: this.configService.get<string>('db.host', '127.0.0.1'),
      port: this.configService.get<number>('db.port', 5432),
      username: this.configService.get<string>('db.username', 'postgres'),
      password: this.configService.get<string>('db.password', ''),
      database: this.configService.get<string>('db.database', 'jangmanal'),
      synchronize: this.configService.get<boolean>('db.synchronize', true),
    };
  }

  get jwtSecret(): string {
    return this.configService.get<string>(
      'auth.jwtSecret',
      'jangmanal-dev-secret',
    );
  }

  get jwtExpiresIn(): StringValue | number {
    return this.configService.get<StringValue>(
      'auth.jwtExpiresIn',
      '1d' as StringValue,
    );
  }

  get mail() {
    return {
      from: this.configService.get<string>(
        'mail.from',
        'no-reply@jangmanal.com',
      ),
      smtpHost: this.configService.get<string>('mail.smtpHost', 'localhost'),
      smtpPort: this.configService.get<number>('mail.smtpPort', 587),
      smtpSecure: this.configService.get<boolean>('mail.smtpSecure', false),
      smtpUser: this.configService.get<string>('mail.smtpUser', ''),
      smtpPass: this.configService.get<string>('mail.smtpPass', ''),
    };
  }

  oauth(provider: OAuthProvider) {
    return {
      clientId: this.configService.get<string>(
        `oauth.${provider}.clientId`,
        '',
      ),
      clientSecret: this.configService.get<string>(
        `oauth.${provider}.clientSecret`,
        '',
      ),
      callbackUrl: this.configService.get<string>(
        `oauth.${provider}.callbackUrl`,
        '',
      ),
    };
  }
}
