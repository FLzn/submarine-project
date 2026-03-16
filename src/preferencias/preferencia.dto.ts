import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdatePreferenciaDto {
  @IsBoolean()
  @IsOptional()
  cleanup_enabled?: boolean;

  @IsInt()
  @Min(1)
  @IsOptional()
  cleanup_interval_months?: number;
}
