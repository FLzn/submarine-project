import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { SmsService } from './sms.service';

@Controller('sms')
export class SmsController {
  constructor(private readonly service: SmsService) {}

  @Get('single-sms')
  singleSms(
    @Query('phoneNumber') phoneNumber: string,
    @Query('message') message: string,
    @Query('token') token: string,
  ) {
    if (!phoneNumber) throw new BadRequestException('phoneNumber é obrigatório');
    if (!message) throw new BadRequestException('message é obrigatório');
    if (!token) throw new BadRequestException('token é obrigatório');
    return this.service.sendSingle({ phoneNumber, message, token });
  }
}
