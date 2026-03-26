import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CategoryEntity } from 'src/modules/categories/entities/category.entity';
import { ProductEntity } from 'src/modules/products/entities/product.entity';
import { SearchQueryDto } from '../dto/search-query.dto';
import { SearchResult } from '../type/search-result.type';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>,
  ) {}

  async search(query: SearchQueryDto): Promise<SearchResult> {
    const products = await this.productsRepository.find({
      where: {
        name: ILike(`%${query.keyword}%`),
        ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      },
      order:
        query.sort === 'price_asc'
          ? { price: 'ASC' }
          : query.sort === 'purchase_desc'
            ? { purchaseCount: 'DESC' }
            : { id: 'DESC' },
      take: 50,
    });

    const categories = await this.categoriesRepository.find({
      where: { name: ILike(`%${query.keyword}%`) },
      take: 30,
    });

    return {
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
      })),
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        mart: product.mart,
        price: Number(product.price),
        categoryId: product.categoryId,
      })),
    };
  }
}
