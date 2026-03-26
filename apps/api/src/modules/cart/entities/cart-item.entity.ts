import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { ProductEntity } from 'src/modules/products/entities/product.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('cart_items')
export class CartItemEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  productId!: string;

  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @ManyToOne(() => UserEntity, (user) => user.cartItems)
  @JoinColumn({ name: 'userId' })
  user!: UserEntity;

  @ManyToOne(() => ProductEntity, (product) => product.cartItems)
  @JoinColumn({ name: 'productId' })
  product!: ProductEntity;

  @UpdateDateColumn()
  updatedAt!: Date;
}
