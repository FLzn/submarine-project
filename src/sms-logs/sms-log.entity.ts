import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Campanha } from '../campanhas/campanha.entity';

@Entity('sms_logs')
export class SmsLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  campanha_id: number;

  @ManyToOne(() => Campanha)
  @JoinColumn({ name: 'campanha_id' })
  campanha: Campanha;

  @Column()
  phone_number: string;

  @Column('text')
  message: string;

  @Column()
  status: number;

  @Column()
  status_description: string;

  @Column({ nullable: true })
  pontal_id: string;

  @Column({ nullable: true })
  reference: string;

  @CreateDateColumn()
  sent_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
