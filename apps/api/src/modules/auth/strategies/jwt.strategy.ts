import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/modules/users/service/users.service';
import { TokenPayload } from '../type/token-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_SECRET',
        'jangmanal-dev-secret',
      ),
    });
  }

  async validate(payload: TokenPayload) {
    try {
      await this.usersService.getById(payload.sub);
      return payload;
    } catch {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }
}
