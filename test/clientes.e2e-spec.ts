import request from 'supertest';
import { ClientesController } from '../src/clientes/clientes.controller';
import { ClientesService } from '../src/clientes/clientes.service';
import { buildApp } from './helpers/build-app';
import { INestApplication } from '@nestjs/common';

const mockCliente = { id: 1, cnpj_cpf: '12.345.678/0001-99', nome: 'Empresa Teste', code: 100, status: 'on' };

const mockService = {
  findAll: jest.fn().mockResolvedValue([mockCliente]),
  findOne: jest.fn().mockResolvedValue(mockCliente),
  create: jest.fn().mockResolvedValue(mockCliente),
  update: jest.fn().mockResolvedValue({ ...mockCliente, nome: 'Atualizado' }),
  remove: jest.fn().mockResolvedValue(undefined),
};

describe('Clientes (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    ({ app, token } = await buildApp(ClientesController, ClientesService, mockService));
  });

  afterAll(async () => await app.close());

  describe('GET /clientes', () => {
    it('sem token → 401', () =>
      request(app.getHttpServer()).get('/clientes').expect(401));

    it('com token → 200 + array', async () => {
      const res = await request(app.getHttpServer())
        .get('/clientes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /clientes/:id', () => {
    it('sem token → 401', () =>
      request(app.getHttpServer()).get('/clientes/1').expect(401));

    it('com token → 200', () =>
      request(app.getHttpServer())
        .get('/clientes/1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200));
  });

  describe('POST /clientes', () => {
    it('sem token → 401', () =>
      request(app.getHttpServer()).post('/clientes').send({}).expect(401));

    it('body inválido (faltando campos) → 400', () =>
      request(app.getHttpServer())
        .post('/clientes')
        .set('Authorization', `Bearer ${token}`)
        .send({ nome: 'Teste' }) // faltando cnpj_cpf e code
        .expect(400));

    it('body válido → 201', () =>
      request(app.getHttpServer())
        .post('/clientes')
        .set('Authorization', `Bearer ${token}`)
        .send({ cnpj_cpf: '12.345.678/0001-99', nome: 'Empresa Teste', code: 100 })
        .expect(201));
  });

  describe('PUT /clientes/:id', () => {
    it('sem token → 401', () =>
      request(app.getHttpServer()).put('/clientes/1').send({}).expect(401));

    it('com token → 200', () =>
      request(app.getHttpServer())
        .put('/clientes/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ nome: 'Atualizado' })
        .expect(200));
  });

  describe('DELETE /clientes/:id', () => {
    it('sem token → 401', () =>
      request(app.getHttpServer()).delete('/clientes/1').expect(401));

    it('com token → 200', () =>
      request(app.getHttpServer())
        .delete('/clientes/1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200));
  });
});
