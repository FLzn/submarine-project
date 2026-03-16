import request from 'supertest';
import { SmsLogsController } from '../src/sms-logs/sms-logs.controller';
import { SmsLogsService } from '../src/sms-logs/sms-logs.service';
import { buildApp } from './helpers/build-app';
import { INestApplication } from '@nestjs/common';

const mockStats = { total: 10, total_delivered: 8, total_pending: 1, total_error: 1, valor_total: 1.2 };
const mockLogs  = { data: [], total: 0, page: 1, limit: 50, pages: 0 };

const mockService = {
  findAll: jest.fn().mockResolvedValue(mockLogs),
  getStats: jest.fn().mockResolvedValue(mockStats),
};

describe('SmsLogs (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    ({ app, token } = await buildApp(SmsLogsController, SmsLogsService, mockService));
  });

  afterAll(async () => await app.close());

  describe('GET /sms-logs', () => {
    it('sem token → 401', () =>
      request(app.getHttpServer()).get('/sms-logs').expect(401));

    it('com token → 200 com paginação', async () => {
      const res = await request(app.getHttpServer())
        .get('/sms-logs')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('pages');
    });

    it('campanhaId inválido → 400', () =>
      request(app.getHttpServer())
        .get('/sms-logs?campanhaId=abc')
        .set('Authorization', `Bearer ${token}`)
        .expect(400));

    it('clienteId inválido → 400', () =>
      request(app.getHttpServer())
        .get('/sms-logs?clienteId=-5')
        .set('Authorization', `Bearer ${token}`)
        .expect(400));

    it('status inválido (não numérico) → 400', () =>
      request(app.getHttpServer())
        .get('/sms-logs?status=invalido')
        .set('Authorization', `Bearer ${token}`)
        .expect(400));

    it('filtros válidos → 200', () =>
      request(app.getHttpServer())
        .get('/sms-logs?campanhaId=1&status=3&page=1&limit=10')
        .set('Authorization', `Bearer ${token}`)
        .expect(200));
  });

  describe('GET /sms-logs/stats', () => {
    it('sem token → 401', () =>
      request(app.getHttpServer()).get('/sms-logs/stats').expect(401));

    it('com token → 200 com totais', async () => {
      const res = await request(app.getHttpServer())
        .get('/sms-logs/stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('total_delivered');
      expect(res.body).toHaveProperty('total_pending');
      expect(res.body).toHaveProperty('total_error');
      expect(res.body).toHaveProperty('valor_total');
    });
  });
});
