import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { OAuthProfile } from '../type/oauth-profile.type';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('KAKAO_CLIENT_ID', ''),
      clientSecret: configService.get<string>('KAKAO_CLIENT_SECRET', ''),
      callbackURL: configService.get<string>(
        'KAKAO_CALLBACK_URL',
        'http://localhost:3000/auth/social/kakao/callback',
      ),
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
      provider: 'kakao',
      providerUserId: profile.id,
      email: profile._json?.kakao_account?.email || '',
      name:
        profile._json?.properties?.nickname || profile.username || 'Kakao User',
      profileImageUrl: profile._json?.properties?.profile_image,
    };

    done(null, user);
  }
}
