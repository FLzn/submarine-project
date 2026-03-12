import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmsLog } from './sms-log.entity';
import { SmsLogsService } from './sms-logs.service';
import { SmsLogsController } from './sms-logs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SmsLog])],
  controllers: [SmsLogsController],
  providers: [SmsLogsService],
  exports: [SmsLogsService],
})
export class SmsLogsModule {}
