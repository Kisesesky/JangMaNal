import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  jwtService: string | Buffer<ArrayBufferLike> | undefined;
  constructor(private configService: ConfigService) {}

  get jwtSecret() {
    return this.configService.get<string>('app.jwtSecret');
  }

  get jwtExpiresIn() {
    return this.configService.get<number>('app.jwtExpiresIn');
  }

  get jwtRefreshSecret() {
    return this.configService.get<string>('app.jwtRefreshSecret');
  }

  get jwtRefreshExpiresIn() {
    return this.configService.get<number>('app.jwtRefreshExpiresIn');
  }

  get port() {
    return this.configService.get<number>('app.port');
  }

  get frontendBaseUrl() {
    return this.configService.get<string>('app.frontendBaseUrl');
  }

  get defaultProfileImage() {
    return this.configService.get<string>('app.defaultProfileImage');
  }
}