import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/base.dto';

export class SearchQueryDto extends PaginationQueryDto {
  @IsString()
  keyword!: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsIn(['price_asc', 'purchase_desc'])
  sort?: 'price_asc' | 'purchase_desc';
}
