import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './configuration';
import * as Joi from 'joi';
import { MailConfigService } from './config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: Joi.object({
        GMAIL_USER: Joi.string().required(),
        GMAIL_PASS: Joi.string().required(),
      }),
      isGlobal: true,
    }),
  ],
  providers: [ConfigService, MailConfigService],
  exports: [ConfigService, MailConfigService],
})
export class MailConfigModule {}