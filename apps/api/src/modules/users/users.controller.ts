import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './service/users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RequestUser } from '../../common/decorators/request-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me(@RequestUser('sub') userId: string) {
    return this.usersService.getById(userId);
  }

  @Patch('me')
  updateProfile(
    @RequestUser('sub') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }
}
