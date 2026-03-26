import { Column, Entity, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

export type VerificationPurpose =
  | 'signup'
  | 'password_reset'
  | 'password_change';

@Entity('verification_codes')
export class VerificationCodeEntity extends BaseEntity {
  @Column({ length: 200 })
  email!: string;

  @Column({ length: 30 })
  purpose!: VerificationPurpose;

  @Column({ length: 10 })
  code!: string;

  @Column({ default: false })
  verified!: boolean;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
