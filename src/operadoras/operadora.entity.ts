import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum OperadoraStatus {
  ON = 'on',
  OFF = 'off',
}

@Entity('operadoras')
export class Operadora {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  endpoint_sms: string;

  @Column({ type: 'enum', enum: OperadoraStatus, default: OperadoraStatus.ON })
  status: OperadoraStatus;
}
