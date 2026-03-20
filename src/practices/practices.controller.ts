import { Controller, Get } from '@nestjs/common';
import { PracticesService } from './practices.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities/user.entity';

@Controller('practices')
export class PracticesController {
  constructor(private practicesService: PracticesService) {}

  @Get()
  findMyPractices(@CurrentUser() user: User) {
    return this.practicesService.findByUser(user.id);
  }
}
