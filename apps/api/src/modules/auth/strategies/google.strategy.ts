import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { OAuthProfile } from '../type/oauth-profile.type';
import { EnvConfigService } from 'src/config/env-config.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(envConfigService: EnvConfigService) {
    const oauth = envConfigService.oauth('google');
    super({
      clientID: oauth.clientId,
      clientSecret: oauth.clientSecret,
      callbackURL: oauth.callbackUrl,
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
