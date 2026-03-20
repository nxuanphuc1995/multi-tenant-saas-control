import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SentEmail } from '../entities/sent-email.entity';

export interface SendEmailParams {
  practiceId: string;
  clientId?: string;
  to: string;
  subject: string;
  body: string;
}

@Injectable()
export class EmailProviderService {
  /** Scopes this integration requires to be approved by a practice */
  readonly requiredScopes = ['client.write'];

  constructor(
    @InjectRepository(SentEmail)
    private sentEmailRepo: Repository<SentEmail>,
  ) {}

  async send(params: SendEmailParams): Promise<SentEmail> {
    const email = this.sentEmailRepo.create(params);
    return this.sentEmailRepo.save(email);
  }

  findAll(practiceId: string) {
    return this.sentEmailRepo.find({
      where: { practiceId },
      order: { timestamp: 'DESC' },
    });
  }
}
