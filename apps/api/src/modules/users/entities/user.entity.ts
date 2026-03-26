import { Column, Entity, OneToMany, UpdateDateColumn } from 'typeorm';
import { UserRole } from '../type/user-role.type';
import { CartItemEntity } from 'src/modules/cart/entities/cart-item.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ unique: true, length: 200 })
  email!: string;

  @Column({ length: 120 })
  name!: string;

  @Column({ length: 30, nullable: true })
  phoneNumber!: string | null;

  @Column({ length: 500, nullable: true })
  profileImageUrl!: string | null;

  @Column({ length: 255, nullable: true })
  passwordHash!: string | null;

  @Column({ default: false })
  emailVerified!: boolean;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => CartItemEntity, (cartItem) => cartItem.user)
  cartItems!: CartItemEntity[];
}
