import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './service/search.service';
import { ProductEntity } from 'src/modules/products/entities/product.entity';
import { CategoryEntity } from 'src/modules/categories/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, CategoryEntity])],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
