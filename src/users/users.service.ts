import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  findAll() {
    return this.repo.find({ select: ['id', 'username', 'email', 'status'] });
  }

  async findOne(id: number) {
    const user = await this.repo.findOne({
      where: { id },
      select: ['id', 'username', 'email', 'status'],
    });
    if (!user) throw new NotFoundException(`User ${id} não encontrado`);
    return user;
  }

  findByUsername(username: string) {
    return this.repo.findOneBy({ username });
  }

  findByEmail(email: string) {
    return this.repo.findOneBy({ email });
  }

  async create(data: Partial<User>) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<User>) {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
