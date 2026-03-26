import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as NaverPassportStrategy } from 'passport-naver-v2';
import { OAuthProfile } from '../type/oauth-profile.type';

@Injectable()
export class NaverStrategy extends PassportStrategy(
  NaverPassportStrategy,
  'naver',
) {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('NAVER_CLIENT_ID', ''),
      clientSecret: configService.get<string>('NAVER_CLIENT_SECRET', ''),
      callbackURL: configService.get<string>(
        'NAVER_CALLBACK_URL',
        'http://localhost:3000/auth/social/naver/callback',
      ),
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: {
      id: string;
      email?: string;
      nickname?: string;
      profileImage?: string;
      displayName?: string;
      _json?: {
        email?: string;
        nickname?: string;
        profile_image?: string;
        name?: string;
      };
    },
    done: (error: unknown, user?: OAuthProfile) => void,
  ): void {
    const user: OAuthProfile = {
      provider: 'naver',
      providerUserId: profile.id,
      email: profile.email || profile._json?.email || '',
      name:
        profile.displayName ||
        profile.nickname ||
        profile._json?.name ||
        profile._json?.nickname ||
        'Naver User',
      profileImageUrl: profile.profileImage || profile._json?.profile_image,
    };

    done(null, user);
  }
}
