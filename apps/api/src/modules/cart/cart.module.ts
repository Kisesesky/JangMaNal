import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItemEntity } from './entities/cart-item.entity';
import { ProductEntity } from 'src/modules/products/entities/product.entity';
import { CartController } from './cart.controller';
import { CartService } from './service/cart.service';
import { CartGateway } from './gateways/cart.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([CartItemEntity, ProductEntity])],
  controllers: [CartController],
  providers: [CartService, CartGateway],
  exports: [CartService],
})
export class CartModule {}
