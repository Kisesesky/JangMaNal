import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as NaverPassportStrategy } from 'passport-naver-v2';
import { OAuthProfile } from '../type/oauth-profile.type';
import { SocialConfigService } from 'src/config/social/config.service';
import { SocialProvider } from '../constants/social-provider.type';

@Injectable()
export class NaverStrategy extends PassportStrategy(
  NaverPassportStrategy,
  'naver',
) {
  constructor(socialConfigService: SocialConfigService) {
    super({
      clientID: socialConfigService.naverClientId as string,
      clientSecret: socialConfigService.naverClientSecret as string,
      callbackURL: socialConfigService.naverCallbackUrl as string,
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
      provider: SocialProvider.NAVER,
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
