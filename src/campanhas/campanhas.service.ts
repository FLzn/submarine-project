import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campanha } from './campanha.entity';

@Injectable()
export class CampanhasService {
  constructor(
    @InjectRepository(Campanha)
    private readonly repo: Repository<Campanha>,
  ) {}

  findAll() {
    return this.repo.find({ relations: ['cliente'] });
  }

  async findOne(id: number) {
    const campanha = await this.repo.findOne({
      where: { id },
      relations: ['cliente'],
    });
    if (!campanha) throw new NotFoundException(`Campanha ${id} não encontrada`);
    return campanha;
  }

  async findByToken(token: string) {
    const campanha = await this.repo.findOne({
      where: { token },
      relations: ['cliente'],
    });
    if (!campanha) throw new NotFoundException(`Token inválido`);
    return campanha;
  }

  create(data: Partial<Campanha>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<Campanha>) {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
