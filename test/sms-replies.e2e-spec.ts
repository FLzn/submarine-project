import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { SmsRepliesController } from '../src/sms-replies/sms-replies.controller';
import { SmsRepliesService } from '../src/sms-replies/sms-replies.service';
import { buildApp } from './helpers/build-app';

const mockData = [
  {
    id: 1,
    message_id: 'msg-001',
    from_number: '5511999990000',
    message: 'Sim',
    received_at: '2026-03-01T10:00:00.000Z',
  },
];

const mockService = {
  findAll: jest.fn().mockResolvedValue({ data: mockData, total: 1, page: 1, limit: 50, pages: 1 }),
};

describe('SmsReplies (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    ({ app, token } = await buildApp(SmsRepliesController, SmsRepliesService, mockService));
  });

  afterAll(async () => await app.close());

  describe('GET /sms-replies', () => {
    it('sem token → 401', () =>
      request(app.getHttpServer()).get('/sms-replies').expect(401));

    it('com token → 200 + estrutura paginada', async () => {
      const res = await request(app.getHttpServer())
        .get('/sms-replies')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
      expect(res.body).toHaveProperty('pages');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('com filtro de data → chama service com os filtros', async () => {
      mockService.findAll.mockClear();
      await request(app.getHttpServer())
        .get('/sms-replies?startDate=2026-03-01&endDate=2026-03-16')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(mockService.findAll).toHaveBeenCalledWith(
        { startDate: '2026-03-01', endDate: '2026-03-16' },
        1,
        50,
      );
    });

    it('com paginação customizada → chama service com page e limit corretos', async () => {
      mockService.findAll.mockClear();
      await request(app.getHttpServer())
        .get('/sms-replies?page=2&limit=10')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(mockService.findAll).toHaveBeenCalledWith({ startDate: undefined, endDate: undefined }, 2, 10);
    });
  });
});
