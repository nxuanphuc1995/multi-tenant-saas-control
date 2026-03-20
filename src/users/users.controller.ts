import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { Public } from '../common/decorators/public.decorator';

/**
 * Public endpoint used by the reviewer UI to populate the user selector.
 * Not intended for production use.
 */
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Public()
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
