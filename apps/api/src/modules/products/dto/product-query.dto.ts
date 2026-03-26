import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/base.dto';

export class ProductQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsIn(['price_asc', 'purchase_desc', 'latest'])
  sort?: 'price_asc' | 'purchase_desc' | 'latest';
}
