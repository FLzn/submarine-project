import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PreferenciasController } from '../src/preferencias/preferencias.controller';
import { PreferenciasService } from '../src/preferencias/preferencias.service';
import { buildApp } from './helpers/build-app';

const mockPreferencia = { id: 1, cleanup_enabled: false, cleanup_interval_months: 3 };

const mockService = {
  get: jest.fn().mockResolvedValue(mockPreferencia),
  update: jest.fn().mockResolvedValue({ ...mockPreferencia, cleanup_enabled: true, cleanup_interval_months: 6 }),
};

describe('Preferencias (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    ({ app, token } = await buildApp(PreferenciasController, PreferenciasService, mockService));
  });

  afterAll(async () => await app.close());

  describe('GET /preferencias', () => {
    it('sem token → 401', () =>
      request(app.getHttpServer()).get('/preferencias').expect(401));

    it('com token → 200 + preferencias', async () => {
      const res = await request(app.getHttpServer())
        .get('/preferencias')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toMatchObject({ id: 1, cleanup_enabled: false, cleanup_interval_months: 3 });
    });
  });

  describe('PUT /preferencias', () => {
    it('sem token → 401', () =>
      request(app.getHttpServer())
        .put('/preferencias')
        .send({ cleanup_enabled: true })
        .expect(401));

    it('campo inválido → 400', () =>
      request(app.getHttpServer())
        .put('/preferencias')
        .set('Authorization', `Bearer ${token}`)
        .send({ cleanup_interval_months: -1 })
        .expect(400));

    it('cleanup_interval_months = 0 → 400', () =>
      request(app.getHttpServer())
        .put('/preferencias')
        .set('Authorization', `Bearer ${token}`)
        .send({ cleanup_interval_months: 0 })
        .expect(400));

    it('payload válido → 200 + dados atualizados', async () => {
      const res = await request(app.getHttpServer())
        .put('/preferencias')
        .set('Authorization', `Bearer ${token}`)
        .send({ cleanup_enabled: true, cleanup_interval_months: 6 })
        .expect(200);

      expect(res.body).toMatchObject({ cleanup_enabled: true, cleanup_interval_months: 6 });
    });
  });
});
