import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItemEntity } from '../entities/cart-item.entity';
import { ProductEntity } from 'src/modules/products/entities/product.entity';
import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { CartSummary } from '../type/cart-summary.type';
import { CartGateway } from '../gateways/cart.gateway';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItemEntity)
    private readonly cartItemRepository: Repository<CartItemEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    private readonly cartGateway: CartGateway,
  ) {}

  async getSummary(userId: string): Promise<CartSummary> {
    const items = await this.cartItemRepository.find({
      where: { userId },
      relations: { product: true },
    });

    const mapped = items.map((item) => {
      const price = Number(item.product.price);
      return {
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productImageUrl: item.product.imageUrl,
        mart: item.product.mart,
        price,
        quantity: item.quantity,
        amount: price * item.quantity,
      };
    });

    return {
      items: mapped,
      totalAmount: mapped.reduce((acc, item) => acc + item.amount, 0),
    };
  }

  async addItem(userId: string, dto: AddCartItemDto): Promise<CartSummary> {
    const product = await this.productRepository.findOne({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다.');
    }

    let cartItem = await this.cartItemRepository.findOne({
      where: { userId, productId: dto.productId },
    });
    if (!cartItem) {
      cartItem = this.cartItemRepository.create({
        userId,
        productId: dto.productId,
        quantity: dto.quantity,
      });
    } else {
      cartItem.quantity += dto.quantity;
    }

    await this.cartItemRepository.save(cartItem);
    const summary = await this.getSummary(userId);
    this.cartGateway.emitCartUpdated(userId, summary);
    return summary;
  }

  async updateItem(
    userId: string,
    cartItemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartSummary> {
    const item = await this.cartItemRepository.findOne({
      where: { id: cartItemId, userId },
    });
    if (!item) {
      throw new NotFoundException('장바구니 항목을 찾을 수 없습니다.');
    }
    item.quantity = dto.quantity;
    await this.cartItemRepository.save(item);

    const summary = await this.getSummary(userId);
    this.cartGateway.emitCartUpdated(userId, summary);
    return summary;
  }

  async removeItem(userId: string, cartItemId: string): Promise<CartSummary> {
    await this.cartItemRepository.delete({ id: cartItemId, userId });
    const summary = await this.getSummary(userId);
    this.cartGateway.emitCartUpdated(userId, summary);
    return summary;
  }
}
