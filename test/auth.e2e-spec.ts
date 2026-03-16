import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { UsersService } from '../src/users/users.service';
import { JwtStrategy } from '../src/auth/jwt.strategy';
import { TEST_SECRET } from './helpers/build-app';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let hashedPassword: string;

  const mockUsersService = {
    findByEmail: jest.fn(),
  };

  beforeAll(async () => {
    hashedPassword = await bcrypt.hash('senha123', 10);

    const module = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({ secret: TEST_SECRET, signOptions: { expiresIn: '1h' } }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        JwtStrategy,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => await app.close());

  describe('POST /auth/login', () => {
    it('credenciais válidas → 201 + access_token', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: 1,
        email: 'admin@test.com',
        username: 'admin',
        password: hashedPassword,
        status: 'on',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@test.com', password: 'senha123' })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
    });

    it('senha errada → 401', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: 1,
        email: 'admin@test.com',
        username: 'admin',
        password: hashedPassword,
        status: 'on',
      });

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@test.com', password: 'errada' })
        .expect(401);
    });

    it('usuário não encontrado → 401', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'naoexiste@test.com', password: 'qualquer' })
        .expect(401);
    });

    it('usuário inativo → 401', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: 1,
        email: 'inativo@test.com',
        username: 'inativo',
        password: hashedPassword,
        status: 'off',
      });

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'inativo@test.com', password: 'senha123' })
        .expect(401);
    });
  });
});
