import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { OAuthProfile } from '../type/oauth-profile.type';
import { SocialConfigService } from 'src/config/social/config.service';
import { SocialProvider } from '../constants/social-provider.type';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    socialConfigService: SocialConfigService
  ) {
    super({
      clientID: socialConfigService.googleClientId as string,
      clientSecret: socialConfigService.googleClientSecret as string,
      callbackURL: socialConfigService.googleCallbackUrl as string,
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
      provider: SocialProvider.GOOGLE,
      providerUserId: profile.id,
      email: profile.emails?.[0]?.value || '',
      name: profile.displayName || 'Google User',
      profileImageUrl: profile.photos?.[0]?.value,
    };

    done(null, user);
  }
}
