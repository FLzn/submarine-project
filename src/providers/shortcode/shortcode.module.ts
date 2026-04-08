import { Module } from '@nestjs/common';
import { ShortcodeController } from './shortcode.controller';
import { SmsLogsModule } from '../../sms-logs/sms-logs.module';
import { SmsRepliesModule } from '../../sms-replies/sms-replies.module';

@Module({
  imports: [SmsLogsModule, SmsRepliesModule],
  controllers: [ShortcodeController],
})
export class ShortcodeModule {}
