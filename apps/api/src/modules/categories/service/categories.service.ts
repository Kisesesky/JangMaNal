import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CategoryEntity } from '../entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
  ) {}

  list(keyword?: string) {
    if (!keyword) {
      return this.categoriesRepository.find({ order: { name: 'ASC' } });
    }
    return this.categoriesRepository.find({
      where: { name: ILike(`%${keyword}%`) },
      order: { name: 'ASC' },
    });
  }
}
