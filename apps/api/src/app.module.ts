import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('PGHOST', '127.0.0.1'),
        port: Number(configService.get<string>('PGPORT', '5432')),
        username: configService.get<string>('PGUSER', 'postgres'),
        password: configService.get<string>('PGPASSWORD', ''),
        database: configService.get<string>('PGDATABASE', 'jangmanal'),
        autoLoadEntities: true,
        synchronize:
          configService.get<string>('TYPEORM_SYNC', 'true') === 'true',
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
