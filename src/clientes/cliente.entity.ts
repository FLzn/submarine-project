import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Campanha } from '../campanhas/campanha.entity';

export enum ClienteStatus {
  ON = 'on',
  OFF = 'off',
}

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  cnpj_cpf: string;

  @Column()
  nome: string;

  @Column()
  code: number;

  @Column({ type: 'enum', enum: ClienteStatus, default: ClienteStatus.ON })
  status: ClienteStatus;

  @OneToMany(() => Campanha, (campanha) => campanha.cliente)
  campanhas: Campanha[];
}
