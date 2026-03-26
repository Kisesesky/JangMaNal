import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './service/cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RequestUser } from '../../common/decorators/request-user.decorator';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  summary(@RequestUser('sub') userId: string) {
    return this.cartService.getSummary(userId);
  }

  @Post('items')
  add(@RequestUser('sub') userId: string, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(userId, dto);
  }

  @Patch('items/:cartItemId')
  update(
    @RequestUser('sub') userId: string,
    @Param('cartItemId') cartItemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(userId, cartItemId, dto);
  }

  @Delete('items/:cartItemId')
  remove(
    @RequestUser('sub') userId: string,
    @Param('cartItemId') cartItemId: string,
  ) {
    return this.cartService.removeItem(userId, cartItemId);
  }
}
