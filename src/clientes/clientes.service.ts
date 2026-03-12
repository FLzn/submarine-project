import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './cliente.entity';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly repo: Repository<Cliente>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const cliente = await this.repo.findOneBy({ id });
    if (!cliente) throw new NotFoundException(`Cliente ${id} não encontrado`);
    return cliente;
  }

  create(data: Partial<Cliente>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<Cliente>) {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
