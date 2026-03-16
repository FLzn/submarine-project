import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdatePreferenciaDto } from './preferencia.dto';
import { PreferenciasService } from './preferencias.service';

@UseGuards(JwtAuthGuard)
@Controller('preferencias')
export class PreferenciasController {
  constructor(private service: PreferenciasService) {}

  @Get()
  get() {
    return this.service.get();
  }

  @Put()
  update(@Body() dto: UpdatePreferenciaDto) {
    return this.service.update(dto);
  }
}
