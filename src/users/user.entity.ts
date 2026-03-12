import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum UserStatus {
  ON = 'on',
  OFF = 'off',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ON })
  status: UserStatus;
}
