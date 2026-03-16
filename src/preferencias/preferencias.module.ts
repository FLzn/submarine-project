import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Preferencia } from './preferencia.entity';
import { SmsLog } from '../sms-logs/sms-log.entity';
import { SmsReply } from '../sms-replies/sms-reply.entity';
import { PreferenciasService } from './preferencias.service';
import { CleanupService } from './cleanup.service';
import { PreferenciasController } from './preferencias.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Preferencia, SmsLog, SmsReply])],
  controllers: [PreferenciasController],
  providers: [PreferenciasService, CleanupService],
})
export class PreferenciasModule {}
