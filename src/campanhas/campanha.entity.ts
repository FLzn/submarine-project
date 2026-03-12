import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cliente } from '../clientes/cliente.entity';

export enum CampanhaStatus {
  ON = 'on',
  OFF = 'off',
}

@Entity('campanhas')
export class Campanha {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cliente_id: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.campanhas)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column()
  descricao: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  valor_sms: number;

  @Column({ unique: true })
  token: string;

  @Column({ type: 'enum', enum: CampanhaStatus, default: CampanhaStatus.ON })
  status: CampanhaStatus;
}
