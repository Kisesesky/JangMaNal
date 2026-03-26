import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { CategoryEntity } from 'src/modules/categories/entities/category.entity';
import { CartItemEntity } from 'src/modules/cart/entities/cart-item.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('products')
export class ProductEntity extends BaseEntity {
  @Column({ length: 100 })
  mart!: string;

  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price!: number;

  @Column({ type: 'int', default: 0 })
  purchaseCount!: number;

  @Column({ length: 500, nullable: true })
  imageUrl!: string | null;

  @Column({ length: 500, nullable: true })
  productUrl!: string | null;

  @Column({ type: 'uuid' })
  categoryId!: string;

  @ManyToOne(() => CategoryEntity, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category!: CategoryEntity;

  @OneToMany(() => CartItemEntity, (cartItem) => cartItem.product)
  cartItems!: CartItemEntity[];
}
