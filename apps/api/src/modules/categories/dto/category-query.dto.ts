import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/base.dto';

export class CategoryQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  keyword?: string;
}
