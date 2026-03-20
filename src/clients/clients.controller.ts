import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
import { PracticeContextGuard } from '../common/guards/practice-context.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';

@Controller('practices/:practiceId/clients')
@UseGuards(PracticeContextGuard, PermissionsGuard)
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get()
  @RequirePermissions('read:clients')
  findAll(@Param('practiceId') practiceId: string) {
    return this.clientsService.findAll(practiceId);
  }

  @Get(':id')
  @RequirePermissions('read:clients')
  findOne(@Param('practiceId') practiceId: string, @Param('id') id: string) {
    return this.clientsService.findOne(practiceId, id);
  }

  @Post()
  @RequirePermissions('create:clients')
  create(
    @Param('practiceId') practiceId: string,
    @Body() dto: CreateClientDto,
  ) {
    return this.clientsService.create(practiceId, dto);
  }

  @Put(':id')
  @RequirePermissions('write:clients')
  update(
    @Param('practiceId') practiceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
  ) {
    return this.clientsService.update(practiceId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('delete:clients')
  remove(@Param('practiceId') practiceId: string, @Param('id') id: string) {
    return this.clientsService.remove(practiceId, id);
  }
}
