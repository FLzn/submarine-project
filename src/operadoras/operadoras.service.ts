import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Operadora, OperadoraStatus } from './operadora.entity';

@Injectable()
export class OperadorasService {
  constructor(
    @InjectRepository(Operadora)
    private readonly repo: Repository<Operadora>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const operadora = await this.repo.findOneBy({ id });
    if (!operadora) throw new NotFoundException(`Operadora ${id} não encontrada`);
    return operadora;
  }

  create(data: Partial<Operadora>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<Operadora>) {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.delete(id);
  }

  async findActive() {
    const operadora = await this.repo.findOneBy({ status: OperadoraStatus.ON });
    if (!operadora) throw new NotFoundException('Nenhuma operadora ativa encontrada');
    return operadora;
  }
}
