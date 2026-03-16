import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('preferencias')
export class Preferencia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  cleanup_enabled: boolean;

  @Column({ default: 3 })
  cleanup_interval_months: number;

  @UpdateDateColumn()
  updated_at: Date;
}
