import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { OperadoraStatus } from './operadora.entity';

export class CreateOperadoraDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsUrl()
  endpoint_sms: string;

  @IsOptional()
  @IsEnum(OperadoraStatus)
  status?: OperadoraStatus;
}

export class UpdateOperadoraDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nome?: string;

  @IsOptional()
  @IsUrl()
  endpoint_sms?: string;

  @IsOptional()
  @IsEnum(OperadoraStatus)
  status?: OperadoraStatus;
}
