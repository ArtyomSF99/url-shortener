import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

/**
 * Controller for user-related endpoints.
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get the profile of the authenticated user.
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req) {
    const userId = req.user.userId;

    const user = await this.usersService.findOne(userId);
    
    if (user) {
      const { password_hash, ...result } = user;
      
      return result;
    }

    return null;
  }
}