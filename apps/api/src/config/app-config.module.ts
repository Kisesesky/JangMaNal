import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './app.config';
import dbConfig from './db.config';
import authConfig from './auth.config';
import mailConfig from './mail.config';
import oauthConfig from './oauth.config';
import { EnvConfigService } from './env-config.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig, authConfig, mailConfig, oauthConfig],
    }),
  ],
  providers: [EnvConfigService],
  exports: [EnvConfigService],
})
export class AppConfigModule {}
