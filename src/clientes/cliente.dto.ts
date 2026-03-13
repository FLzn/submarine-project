import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ClienteStatus } from './cliente.entity';

export class CreateClienteDto {
  @IsString()
  @IsNotEmpty()
  cnpj_cpf: string;

  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsInt()
  @Min(1)
  code: number;

  @IsOptional()
  @IsEnum(ClienteStatus)
  status?: ClienteStatus;
}

export class UpdateClienteDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  cnpj_cpf?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nome?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  code?: number;

  @IsOptional()
  @IsEnum(ClienteStatus)
  status?: ClienteStatus;
}
