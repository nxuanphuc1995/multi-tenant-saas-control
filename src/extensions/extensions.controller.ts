import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ExtensionsService } from './extensions.service';
import { PracticeContextGuard } from '../common/guards/practice-context.guard';
import { CurrentMembership } from '../common/decorators/current-user.decorator';
import { PracticeMembership } from '../entities/practice-membership.entity';

@Controller('practices/:practiceId/clients/:clientId/extensions')
@UseGuards(PracticeContextGuard)
export class ExtensionsController {
  constructor(private extensionsService: ExtensionsService) {}

  @Get()
  findForSlot(
    @Param('practiceId') practiceId: string,
    @Query('slot') slot: string,
    @CurrentMembership() membership: PracticeMembership,
  ) {
    return this.extensionsService.findForSlot(
      practiceId,
      slot || 'client.sidepanel',
      membership.role,
    );
  }
}
