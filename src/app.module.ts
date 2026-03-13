import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Cliente } from './clientes/cliente.entity';
import { Campanha } from './campanhas/campanha.entity';
import { Operadora } from './operadoras/operadora.entity';
import { User } from './users/user.entity';
import { SmsLog } from './sms-logs/sms-log.entity';
import { SmsReply } from './sms-replies/sms-reply.entity';
import { SmsLogsModule } from './sms-logs/sms-logs.module';
import { SmsRepliesModule } from './sms-replies/sms-replies.module';
import { ClientesModule } from './clientes/clientes.module';
import { CampanhasModule } from './campanhas/campanhas.module';
import { OperadorasModule } from './operadoras/operadoras.module';
import { UsersModule } from './users/users.module';
import { SmsModule } from './sms/sms.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASS'),
        database: config.get('DB_NAME'),
        entities: [Cliente, Campanha, Operadora, User, SmsLog, SmsReply],
        synchronize: false,
        extra: {
          max: 10,
        },
      }),
    }),
    ClientesModule,
    CampanhasModule,
    OperadorasModule,
    UsersModule,
    SmsModule,
    SmsLogsModule,
    SmsRepliesModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
