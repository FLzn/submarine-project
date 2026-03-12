import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Operadora } from './operadora.entity';
import { OperadorasService } from './operadoras.service';
import { OperadorasController } from './operadoras.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Operadora])],
  controllers: [OperadorasController],
  providers: [OperadorasService],
  exports: [OperadorasService],
})
export class OperadorasModule {}
