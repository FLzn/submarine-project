import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { CampanhaStatus } from './campanha.entity';

export class CreateCampanhaDto {
  @IsInt()
  @Min(1)
  cliente_id: number;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  valor_sms: number;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsOptional()
  @IsEnum(CampanhaStatus)
  status?: CampanhaStatus;
}

export class UpdateCampanhaDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  cliente_id?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  descricao?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  valor_sms?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  token?: string;

  @IsOptional()
  @IsEnum(CampanhaStatus)
  status?: CampanhaStatus;
}
