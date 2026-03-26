import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, Repository } from 'typeorm';
import { ProductEntity } from '../entities/product.entity';
import { ProductQueryDto } from '../dto/product-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>,
  ) {}

  list(query: ProductQueryDto) {
    const order: FindOptionsOrder<ProductEntity> =
      query.sort === 'price_asc'
        ? { price: 'ASC' }
        : query.sort === 'purchase_desc'
          ? { purchaseCount: 'DESC' }
          : { id: 'DESC' };

    return this.productsRepository.find({
      where: query.categoryId ? { categoryId: query.categoryId } : {},
      order,
      relations: { category: true },
    });
  }
}
