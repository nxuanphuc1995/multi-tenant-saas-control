import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../entities/client.entity';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientRepo: Repository<Client>,
  ) {}

  findAll(practiceId: string) {
    return this.clientRepo.find({ where: { practiceId } });
  }

  async findOne(practiceId: string, id: string) {
    const client = await this.clientRepo.findOne({ where: { id, practiceId } });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  create(practiceId: string, dto: CreateClientDto) {
    const client = this.clientRepo.create({ ...dto, practiceId });
    return this.clientRepo.save(client);
  }

  async update(practiceId: string, id: string, dto: UpdateClientDto) {
    const client = await this.findOne(practiceId, id);
    Object.assign(client, dto);
    return this.clientRepo.save(client);
  }

  async remove(practiceId: string, id: string) {
    const client = await this.findOne(practiceId, id);
    return this.clientRepo.remove(client);
  }
}
