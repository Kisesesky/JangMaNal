import { Controller, Get, Query } from '@nestjs/common';
import { CategoriesService } from './service/categories.service';
import { CategoryQueryDto } from './dto/category-query.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  list(@Query() query: CategoryQueryDto) {
    return this.categoriesService.list(query.keyword);
  }
}
