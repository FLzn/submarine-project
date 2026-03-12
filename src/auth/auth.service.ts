import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    if (user.status === 'off') {
      throw new UnauthorizedException('Usuário inativo');
    }

    const payload = { sub: user.id, email: user.email, username: user.username };
    return { access_token: this.jwtService.sign(payload) };
  }
}
