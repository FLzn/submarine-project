import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmsReply } from './sms-reply.entity';
import { SmsRepliesService } from './sms-replies.service';
import { SmsRepliesController } from './sms-replies.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SmsReply])],
  controllers: [SmsRepliesController],
  providers: [SmsRepliesService],
  exports: [SmsRepliesService],
})
export class SmsRepliesModule {}
