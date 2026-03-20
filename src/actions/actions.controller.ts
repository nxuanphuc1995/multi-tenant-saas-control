import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { ExecuteActionDto } from './dto/execute-action.dto';
import { PracticeContextGuard } from '../common/guards/practice-context.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { CurrentMembership } from '../common/decorators/current-user.decorator';
import { PracticeMembership } from '../entities/practice-membership.entity';

@Controller('practices/:practiceId/actions')
@UseGuards(PracticeContextGuard, PermissionsGuard)
export class ActionsController {
  constructor(private actionsService: ActionsService) {}

  @Post()
  @RequirePermissions('action:email.send')
  execute(
    @Param('practiceId') practiceId: string,
    @CurrentMembership() membership: PracticeMembership,
    @Body() dto: ExecuteActionDto,
  ) {
    return this.actionsService.execute(practiceId, membership, dto);
  }
}
