import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SmsLogsService } from './sms-logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

function parseId(value: string | undefined, name: string): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0)
    throw new BadRequestException(`${name} deve ser um número inteiro positivo`);
  return n;
}

function parseStatus(value: string | undefined): number | undefined {
  if (value === undefined || value === '') return undefined;
  const n = Number(value);
  if (isNaN(n)) throw new BadRequestException('status deve ser um número');
  return n;
}

function parsePage(value: string | undefined, defaultVal: number): number {
  if (!value) return defaultVal;
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : defaultVal;
}

@UseGuards(JwtAuthGuard)
@Controller('sms-logs')
export class SmsLogsController {
  constructor(private readonly service: SmsLogsService) {}

  @Get()
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('campanhaId') campanhaId?: string,
    @Query('campanhaName') campanhaName?: string,
    @Query('clienteId') clienteId?: string,
    @Query('clienteName') clienteName?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll(
      {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        campanhaId: parseId(campanhaId, 'campanhaId'),
        campanhaName: campanhaName || undefined,
        clienteId: parseId(clienteId, 'clienteId'),
        clienteName: clienteName || undefined,
        status: parseStatus(status),
      },
      parsePage(page, 1),
      parsePage(limit, 50),
    );
  }

  @Get('stats')
  getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('campanhaId') campanhaId?: string,
    @Query('campanhaName') campanhaName?: string,
    @Query('clienteId') clienteId?: string,
    @Query('clienteName') clienteName?: string,
  ) {
    return this.service.getStats({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      campanhaId: parseId(campanhaId, 'campanhaId'),
      campanhaName: campanhaName || undefined,
      clienteId: parseId(clienteId, 'clienteId'),
      clienteName: clienteName || undefined,
    });
  }
}
