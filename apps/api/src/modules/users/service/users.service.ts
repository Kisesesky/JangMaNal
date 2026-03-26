import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UserRole } from '../type/user-role.type';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async getById(userId: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return user;
  }

  findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async createLocalUser(input: {
    email: string;
    name: string;
    phoneNumber: string;
    profileImageUrl: string;
    passwordHash: string;
  }): Promise<UserEntity> {
    const user = this.usersRepository.create({
      ...input,
      emailVerified: true,
      role: UserRole.USER,
    });
    return this.usersRepository.save(user);
  }

  async createSocialUser(input: {
    email: string;
    name: string;
    profileImageUrl: string;
  }): Promise<UserEntity> {
    const user = this.usersRepository.create({
      email: input.email,
      name: input.name,
      profileImageUrl: input.profileImageUrl,
      emailVerified: true,
      passwordHash: null,
      phoneNumber: null,
      role: UserRole.USER,
    });
    return this.usersRepository.save(user);
  }

  async updatePassword(
    userId: string,
    passwordHash: string,
  ): Promise<UserEntity> {
    const user = await this.getById(userId);
    user.passwordHash = passwordHash;
    return this.usersRepository.save(user);
  }

  async markEmailVerifiedByEmail(email: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) return;
    user.emailVerified = true;
    await this.usersRepository.save(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserEntity> {
    const user = await this.getById(userId);
    if (dto.name !== undefined) user.name = dto.name;
    if (dto.profileImageUrl !== undefined)
      user.profileImageUrl = dto.profileImageUrl;
    if (dto.phoneNumber !== undefined) user.phoneNumber = dto.phoneNumber;
    return this.usersRepository.save(user);
  }
}
