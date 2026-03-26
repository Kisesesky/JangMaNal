import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  VerificationCodeEntity,
  VerificationPurpose,
} from '../entities/verification-code.entity';
import { SocialAccountEntity } from '../entities/social-account.entity';

@Injectable()
export class AuthStoreService {
  constructor(
    @InjectRepository(VerificationCodeEntity)
    private readonly verificationRepository: Repository<VerificationCodeEntity>,
    @InjectRepository(SocialAccountEntity)
    private readonly socialAccountRepository: Repository<SocialAccountEntity>,
  ) {}

  createVerificationCode(input: {
    email: string;
    purpose: VerificationPurpose;
    code: string;
    expiresAt: Date;
  }) {
    return this.verificationRepository.save(
      this.verificationRepository.create({
        ...input,
        verified: false,
      }),
    );
  }

  findVerificationCode(input: {
    email: string;
    purpose: VerificationPurpose;
    code: string;
  }) {
    return this.verificationRepository.findOne({
      where: input,
      order: { createdAt: 'DESC' },
    });
  }

  findVerifiedCode(input: { email: string; purpose: VerificationPurpose }) {
    return this.verificationRepository.findOne({
      where: { ...input, verified: true },
      order: { createdAt: 'DESC' },
    });
  }

  async markVerificationCodeVerified(
    row: VerificationCodeEntity,
  ): Promise<void> {
    row.verified = true;
    await this.verificationRepository.save(row);
  }

  findSocialAccount(input: {
    provider: 'google' | 'naver' | 'kakao';
    providerUserId: string;
  }) {
    return this.socialAccountRepository.findOne({
      where: input,
      relations: { user: true },
    });
  }

  async createSocialAccount(input: {
    provider: 'google' | 'naver' | 'kakao';
    providerUserId: string;
    userId: string;
  }): Promise<void> {
    const row = this.socialAccountRepository.create(input);
    await this.socialAccountRepository.save(row);
  }
}
