import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SmsController } from './sms.controller';
import { OperadorasModule } from '../operadoras/operadoras.module';
import { CampanhasModule } from '../campanhas/campanhas.module';
import { SmsLogsModule } from '../sms-logs/sms-logs.module';
import { SmsRepliesModule } from '../sms-replies/sms-replies.module';

@Module({
  imports: [OperadorasModule, CampanhasModule, SmsLogsModule, SmsRepliesModule],
  controllers: [SmsController],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
