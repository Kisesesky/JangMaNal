import { Column, Entity, OneToMany } from 'typeorm';
import { ProductEntity } from 'src/modules/products/entities/product.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('categories')
export class CategoryEntity extends BaseEntity {
  @Column({ unique: true, length: 100 })
  name!: string;

  @OneToMany(() => ProductEntity, (product) => product.category)
  products!: ProductEntity[];
}
