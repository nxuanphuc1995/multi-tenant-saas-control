import { IsString, IsEmail, IsUUID } from 'class-validator';

export class ExecuteActionDto {
  @IsString()
  type: string; // e.g. 'email.send'

  @IsUUID()
  client_id: string;

  @IsEmail()
  to: string;

  @IsString()
  subject: string;

  @IsString()
  body: string;

  @IsString()
  idempotency_key: string;
}
