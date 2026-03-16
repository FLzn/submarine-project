import request from 'supertest';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';
import { buildApp } from './helpers/build-app';
import { INestApplication } from '@nestjs/common';

const mockUser = {
  id: 1,
  username: 'admin',
  email: 'admin@test.com',
  status: 'on',
  // password nunca retornado pelo service
};

const mockService = {
  findAll: jest.fn().mockResolvedValue([mockUser]),
  findOne: jest.fn().mockResolvedValue(mockUser),
  create: jest.fn().mockResolvedValue(mockUser),
  update: jest.fn().mockResolvedValue({ ...mockUser, username: 'atualizado' }),
  remove: jest.fn().mockResolvedValue(undefined),
};

describe('Users (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    ({ app, token } = await buildApp(UsersController, UsersService, mockService));
  });

  afterAll(async () => await app.close());

  describe('GET /users', () => {
    it('sem token → 401', () =>
      request(app.getHttpServer()).get('/users').expect(401));

    it('com token → 200 + array', async () => {
      const res = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /users/:id', () => {
    it('sem token → 401', () =>
      request(app.getHttpServer()).get('/users/1').expect(401));

    it('com token → 200', () =>
      request(app.getHttpServer())
        .get('/users/1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200));
  });

  describe('POST /users', () => {
    it('sem token → 401', () =>
      request(app.getHttpServer()).post('/users').send({}).expect(401));

    it('senha curta (< 6) → 400', () =>
      request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${token}`)
        .send({ username: 'novo', email: 'novo@test.com', password: '123' })
        .expect(400));

    it('email inválido → 400', () =>
      request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${token}`)
        .send({ username: 'novo', email: 'nao-e-email', password: 'senha123' })
        .expect(400));

    it('body válido → 201', () =>
      request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${token}`)
        .send({ username: 'novo', email: 'novo@test.com', password: 'senha123' })
        .expect(201));
  });

  describe('PUT /users/:id', () => {
    it('sem token → 401', () =>
      request(app.getHttpServer()).put('/users/1').send({}).expect(401));

    it('com token → 200', () =>
      request(app.getHttpServer())
        .put('/users/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ username: 'atualizado' })
        .expect(200));
  });

  describe('DELETE /users/:id', () => {
    it('sem token → 401', () =>
      request(app.getHttpServer()).delete('/users/1').expect(401));

    it('com token → 200', () =>
      request(app.getHttpServer())
        .delete('/users/1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200));
  });
});
