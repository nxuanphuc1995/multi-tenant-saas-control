import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Extension } from '../entities/extension.entity';
import { IntegrationsService } from '../integrations/integrations.service';
import { Role } from '../common/roles';

@Injectable()
export class ExtensionsService {
  constructor(
    @InjectRepository(Extension)
    private extensionRepo: Repository<Extension>,
    private integrationsService: IntegrationsService,
  ) {}

  async findForSlot(practiceId: string, slot: string, role: Role) {
    const extensions = await this.extensionRepo.find({ where: { slot } });
    const result: Extension[] = [];

    for (const ext of extensions) {
      // Filter by role visibility
      const roles = ext.visibleToRoles ?? [];
      if (roles.length > 0 && !roles.includes(role)) continue;

      // Filter by approved scopes
      const scopes = ext.requiredScopes ?? [];
      if (scopes.length > 0) {
        const approved = await this.integrationsService.hasScopesApproved(
          practiceId,
          scopes,
        );
        if (!approved) continue;
      }

      result.push(ext);
    }

    return result;
  }
}
