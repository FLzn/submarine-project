import request from 'supertest';
import { CampanhasController } from '../src/campanhas/campanhas.controller';
import { CampanhasService } from '../src/campanhas/campanhas.service';
import { buildApp } from './helpers/build-app';
import { INestApplication } from '@nestjs/common';

const mockCampanha = {
  id: 1,
  cliente_id: 1,
  descricao: 'Campanha Teste',
  valor_sms: '0.1500',
  token: 'token-abc-123',
  status: 'on',
};

const mockService = {
  findAll: jest.fn().mockResolvedValue([mockCampanha]),
  findOne: jest.fn().mockResolvedValue(mockCampanha),
  create: jest.fn().mockResolvedValue(mockCampanha),
  update: jest.fn().mockResolvedValue({ ...mockCampanha, descricao: 'Atualizada' }),
  remove: jest.fn().mockResolvedValue(undefined),
};

describe('Campanhas (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    ({ app, token } = await buildApp(CampanhasController, CampanhasService, mockService));
  });

  afterAll(async () => await app.close());

  describe('GET /campanhas', () => {
    it('sem token → 401', () =>
      request(app.getHttpServer()).get('/campanhas').expect(401));

    it('com token → 200 + array', async () => {
      const res = await request(app.getHttpServer())
        .get('/campanhas')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /campanhas/:id', () => {
    it('sem token → 401', () =>
      request(app.getHttpServer()).get('/campanhas/1').expect(401));

    it('com token → 200', () =>
      request(app.getHttpServer())
        .get('/campanhas/1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200));
  });

  describe('POST /campanhas', () => {
    it('sem token → 401', () =>
      request(app.getHttpServer()).post('/campanhas').send({}).expect(401));

    it('body inválido → 400', () =>
      request(app.getHttpServer())
        .post('/campanhas')
        .set('Authorization', `Bearer ${token}`)
        .send({ descricao: 'Só descrição' }) // faltando cliente_id, valor_sms, token
        .expect(400));

    it('body válido → 201', () =>
      request(app.getHttpServer())
        .post('/campanhas')
        .set('Authorization', `Bearer ${token}`)
        .send({ cliente_id: 1, descricao: 'Campanha Teste', valor_sms: 0.15, token: 'tok-xyz' })
        .expect(201));
  });

  describe('PUT /campanhas/:id', () => {
    it('sem token → 401', () =>
      request(app.getHttpServer()).put('/campanhas/1').send({}).expect(401));

    it('com token → 200', () =>
      request(app.getHttpServer())
        .put('/campanhas/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ descricao: 'Atualizada' })
        .expect(200));
  });

  describe('DELETE /campanhas/:id', () => {
    it('sem token → 401', () =>
      request(app.getHttpServer()).delete('/campanhas/1').expect(401));

    it('com token → 200', () =>
      request(app.getHttpServer())
        .delete('/campanhas/1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200));
  });
});
