import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { OAuthProfile } from '../type/oauth-profile.type';
import { SocialConfigService } from 'src/config/social/config.service';
import { SocialProvider } from '../constants/social-provider.type';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(socialConfigService: SocialConfigService) {
    super({
      clientID: socialConfigService.kakaoClientId as string,
      clientSecret: socialConfigService.kakaoClientSecret as string,
      callbackURL: socialConfigService.kakaoCallbackUrl as string,
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: {
      id: string;
      username?: string;
      _json?: {
        properties?: { nickname?: string; profile_image?: string };
        kakao_account?: { email?: string };
      };
    },
    done: (error: unknown, user?: OAuthProfile) => void,
  ): void {
    const user: OAuthProfile = {
      provider: SocialProvider.KAKAO,
      providerUserId: profile.id,
      email: profile._json?.kakao_account?.email || '',
      name:
        profile._json?.properties?.nickname || profile.username || 'Kakao User',
      profileImageUrl: profile._json?.properties?.profile_image,
    };

    done(null, user);
  }
}
