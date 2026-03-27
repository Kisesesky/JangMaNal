import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import type { SocialProvider } from '../constants/social-provider.type';

@Entity('social_accounts')
@Unique('uq_social_provider_user', ['provider', 'providerUserId'])
export class SocialAccountEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ length: 20 })
  provider!: SocialProvider;

  @Column({ length: 200 })
  providerUserId!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user!: UserEntity;
}
