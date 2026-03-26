import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { OAuthProfile } from '../type/oauth-profile.type';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID', ''),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET', ''),
      callbackURL: configService.get<string>(
        'GOOGLE_CALLBACK_URL',
        'http://localhost:3000/auth/social/google/callback',
      ),
      scope: ['profile', 'email'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: {
      id: string;
      displayName: string;
      emails?: Array<{ value: string }>;
      photos?: Array<{ value: string }>;
    },
    done: VerifyCallback,
  ): void {
    const user: OAuthProfile = {
      provider: 'google',
      providerUserId: profile.id,
      email: profile.emails?.[0]?.value || '',
      name: profile.displayName || 'Google User',
      profileImageUrl: profile.photos?.[0]?.value,
    };

    done(null, user);
  }
}
