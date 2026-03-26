import { Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from './service/products.service';
import { ProductQueryDto } from './dto/product-query.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list(@Query() query: ProductQueryDto) {
    return this.productsService.list(query);
  }
}
