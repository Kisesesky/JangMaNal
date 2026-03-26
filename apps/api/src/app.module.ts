import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UsersModule } from 'src/modules/users/users.module';
import { CartModule } from 'src/modules/cart/cart.module';
import { CategoriesModule } from 'src/modules/categories/categories.module';
import { ProductsModule } from 'src/modules/products/products.module';
import { SearchModule } from 'src/modules/search/search.module';
import { MailModule } from 'src/modules/mail/mail.module';
import { AppConfigModule } from 'src/config/app-config.module';
import { EnvConfigService } from 'src/config/env-config.service';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [EnvConfigService],
      useFactory: (envConfigService: EnvConfigService) => ({
        ...envConfigService.db,
        type: 'postgres',
        autoLoadEntities: true,
      }),
    }),
    AuthModule,
    UsersModule,
    CartModule,
    CategoriesModule,
    ProductsModule,
    SearchModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
