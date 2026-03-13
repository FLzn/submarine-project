import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sms_replies')
export class SmsReply {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  sms_log_id: number;

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
