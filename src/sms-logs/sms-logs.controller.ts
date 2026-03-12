import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SmsLogsService } from './sms-logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('sms-logs')
export class SmsLogsController {
  constructor(private readonly service: SmsLogsService) {}

  @Get()
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('campanhaId') campanhaId?: string,
    @Query('clienteId') clienteId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll(
      {
        startDate,
        endDate,
        campanhaId: campanhaId ? Number(campanhaId) : undefined,
        clienteId: clienteId ? Number(clienteId) : undefined,
        status: status !== undefined ? Number(status) : undefined,
      },
      page ? Number(page) : 1,
      limit ? Number(limit) : 50,
    );
  }

  @Get('stats')
  getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('campanhaId') campanhaId?: string,
    @Query('clienteId') clienteId?: string,
  ) {
    return this.service.getStats({
      startDate,
      endDate,
      campanhaId: campanhaId ? Number(campanhaId) : undefined,
      clienteId: clienteId ? Number(clienteId) : undefined,
    });
  }
}
