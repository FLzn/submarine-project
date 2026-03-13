import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SmsRepliesService } from './sms-replies.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('sms-replies')
export class SmsRepliesController {
  constructor(private readonly service: SmsRepliesService) {}

  @Get()
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll(
      { startDate, endDate },
      page ? Number(page) : 1,
      limit ? Number(limit) : 50,
    );
  }
}
