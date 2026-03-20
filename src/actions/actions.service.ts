import {
  Injectable,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActionRun, ActionStatus } from '../entities/action-run.entity';
import { ActorType, AuditOutcome } from '../entities/audit-log.entity';
import { EmailProviderService } from '../email-provider/email-provider.service';
import { IntegrationsService } from '../integrations/integrations.service';
import { AuditService } from '../audit/audit.service';
import { ClientsService } from '../clients/clients.service';
import { ExecuteActionDto } from './dto/execute-action.dto';
import { PracticeMembership } from '../entities/practice-membership.entity';
import { Role } from '../common/roles';

@Injectable()
export class ActionsService {
  constructor(
    @InjectRepository(ActionRun)
    private actionRunRepo: Repository<ActionRun>,
    private emailProvider: EmailProviderService,
    private integrationsService: IntegrationsService,
    private auditService: AuditService,
    private clientsService: ClientsService,
  ) {}

  async execute(
    practiceId: string,
    membership: PracticeMembership,
    dto: ExecuteActionDto,
  ) {
    if (dto.type !== 'email.send') {
      throw new BadRequestException(`Unsupported action type: ${dto.type}`);
    }

    // Idempotency check
    const existing = await this.actionRunRepo.findOne({
      where: { practiceId, idempotencyKey: dto.idempotency_key },
    });
    if (existing) {
      return { idempotent: true, actionRun: existing };
    }

    // Validate client belongs to this practice
    await this.clientsService.findOne(practiceId, dto.client_id);

    // Validate integration scopes
    const scopesApproved = await this.integrationsService.hasScopesApproved(
      practiceId,
      ['client.write'],
    );
    if (!scopesApproved) {
      throw new ForbiddenException(
        'Practice has not approved the client.write scope for EmailProvider',
      );
    }

    let status = ActionStatus.Success;
    let result: Record<string, any> = {};

    try {
      const sentEmail = await this.emailProvider.send({
        practiceId,
        clientId: dto.client_id,
        to: dto.to,
        subject: dto.subject,
        body: dto.body,
      });
      result = { sentEmailId: sentEmail.id };
    } catch (err) {
      status = ActionStatus.Failure;
      result = { error: err.message };
    }

    const actionRun = await this.actionRunRepo.save(
      this.actionRunRepo.create({
        practiceId,
        idempotencyKey: dto.idempotency_key,
        actionType: dto.type,
        actorId: membership.userId,
        clientId: dto.client_id,
        status,
        result,
      }),
    );

    await this.auditService.log({
      practiceId,
      actorId: membership.userId,
      actorType:
        membership.role === Role.Integration
          ? ActorType.Integration
          : ActorType.User,
      action: dto.type,
      targetId: dto.client_id,
      targetType: 'client',
      outcome:
        status === ActionStatus.Success
          ? AuditOutcome.Success
          : AuditOutcome.Failure,
      metadata: {
        to: dto.to,
        subject: dto.subject,
        idempotencyKey: dto.idempotency_key,
      },
    });

    return { idempotent: false, actionRun };
  }
}
