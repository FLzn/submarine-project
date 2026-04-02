import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SmsLog } from '../sms-logs/sms-log.entity';

@Entity('sms_replies')
export class SmsReply {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  sms_log_id: number;

  @ManyToOne(() => SmsLog, { nullable: true, eager: false })
  @JoinColumn({ name: 'sms_log_id' })
  sms_log: SmsLog;

  @Column()
  message_id: string;

  @Column({ nullable: true })
  reference: string;

  @Column('text')
  message: string;

  @Column()
  from_number: string;

  @Column({ nullable: true })
  classify: string;

  @Column({ nullable: true })
  value: string;

  @Column({ type: 'timestamptz', nullable: true })
  received_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
