import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Preferencia } from './preferencia.entity';
import { UpdatePreferenciaDto } from './preferencia.dto';

@Injectable()
export class PreferenciasService {
  constructor(
    @InjectRepository(Preferencia)
    private repo: Repository<Preferencia>,
  ) {}

  async get(): Promise<Preferencia> {
    let pref = await this.repo.findOne({ where: { id: 1 } });
    if (!pref) {
      pref = this.repo.create({ id: 1, cleanup_enabled: false, cleanup_interval_months: 3 });
      await this.repo.save(pref);
    }
    return pref;
  }

  async update(dto: UpdatePreferenciaDto): Promise<Preferencia> {
    await this.get(); // garante que a linha existe
    await this.repo.update(1, dto);
    return this.get();
  }
}
