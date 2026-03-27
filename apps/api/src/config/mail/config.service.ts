import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailConfigService {
  constructor(private configService: ConfigService) {}

  get user() {
    return this.configService.get<string>('mail.user');
  }

  get pass() {
    return this.configService.get<string>('mail.pass');
  }
}