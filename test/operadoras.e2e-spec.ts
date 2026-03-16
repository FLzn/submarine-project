import request from 'supertest';
import { OperadorasController } from '../src/operadoras/operadoras.controller';
import { OperadorasService } from '../src/operadoras/operadoras.service';
import { buildApp } from './helpers/build-app';
import { INestApplication } from '@nestjs/common';

const mockOperadora = {
  id: 1,
  nome: 'Pontaltech',
  endpoint_sms: 'https://api.pontaltech.com.br/v3/sms',
  status: 'on',
};

const mockService = {
  findAll: jest.fn().mockResolvedValue([mockOperadora]),
  findOne: jest.fn().mockResolvedValue(mockOperadora),
  create: jest.fn().mockResolvedValue(mockOperadora),
  update: jest.fn().mockResolvedValue({ ...mockOperadora, nome: 'Atualizada' }),
  remove: jest.fn().mockResolvedValue(undefined),
};

describe('Operadoras (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    ({ app, token } = await buildApp(OperadorasController, OperadorasService, mockService));
  });

  afterAll(async () => await app.close());

  describe('GET /operadoras', () => {
    it('sem token → 401', () =>
      request(app.getHttpServer()).get('/operadoras').expect(401));

    it('com token → 200 + array', async () => {
      const res = await request(app.getHttpServer())
        .get('/operadoras')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /operadoras/:id', () => {
    it('sem token → 401', () =>
      request(app.getHttpServer()).get('/operadoras/1').expect(401));

    it('com token → 200', () =>
      request(app.getHttpServer())
        .get('/operadoras/1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200));
  });

  describe('POST /operadoras', () => {
    it('sem token → 401', () =>
      request(app.getHttpServer()).post('/operadoras').send({}).expect(401));

    it('body inválido (endpoint não é URL) → 400', () =>
      request(app.getHttpServer())
        .post('/operadoras')
        .set('Authorization', `Bearer ${token}`)
        .send({ nome: 'Teste', endpoint_sms: 'nao-e-uma-url' })
        .expect(400));

    it('body válido → 201', () =>
      request(app.getHttpServer())
        .post('/operadoras')
        .set('Authorization', `Bearer ${token}`)
        .send({ nome: 'Pontaltech', endpoint_sms: 'https://api.pontaltech.com.br/v3/sms' })
        .expect(201));
  });

  describe('PUT /operadoras/:id', () => {
    it('sem token → 401', () =>
      request(app.getHttpServer()).put('/operadoras/1').send({}).expect(401));

    it('com token → 200', () =>
      request(app.getHttpServer())
        .put('/operadoras/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ nome: 'Atualizada' })
        .expect(200));
  });

  describe('DELETE /operadoras/:id', () => {
    it('sem token → 401', () =>
      request(app.getHttpServer()).delete('/operadoras/1').expect(401));

    it('com token → 200', () =>
      request(app.getHttpServer())
        .delete('/operadoras/1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200));
  });
});
