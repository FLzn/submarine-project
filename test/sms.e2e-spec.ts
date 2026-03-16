import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { SmsController } from '../src/sms/sms.controller';
import { SmsService } from '../src/sms/sms.service';

// SmsController não tem JwtAuthGuard — é público por design
const mockSmsResult = { id: 'pontal-123', status: 1, statusDescription: 'Enviado' };

const mockService = {
  sendSingle: jest.fn().mockResolvedValue(mockSmsResult),
  handleCallback: jest.fn().mockResolvedValue({ received: true }),
};

describe('SMS (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [SmsController],
      providers: [{ provide: SmsService, useValue: mockService }],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => await app.close());

  describe('GET /sms/single-sms', () => {
    it('sem parâmetros → 400', () =>
      request(app.getHttpServer()).get('/sms/single-sms').expect(400));

    it('sem phoneNumber → 400', () =>
      request(app.getHttpServer())
        .get('/sms/single-sms?message=Oi&token=tok')
        .expect(400));

    it('sem message → 400', () =>
      request(app.getHttpServer())
        .get('/sms/single-sms?phoneNumber=11999999999&token=tok')
        .expect(400));

    it('sem token → 400', () =>
      request(app.getHttpServer())
        .get('/sms/single-sms?phoneNumber=11999999999&message=Oi')
        .expect(400));

    it('parâmetros completos → 200', () =>
      request(app.getHttpServer())
        .get('/sms/single-sms?phoneNumber=11999999999&message=Oi&token=meu-token')
        .expect(200));
  });

  describe('POST /sms/callback', () => {
    it('DLR callback → 200 + received: true', async () => {
      const res = await request(app.getHttpServer())
        .post('/sms/callback')
        .send({ id: 'pontal-123', status: '3', statusDescription: 'Entregue' })
        .expect(201);
      expect(res.body).toEqual({ received: true });
    });

    it('MO callback → 200 + received: true', async () => {
      const res = await request(app.getHttpServer())
        .post('/sms/callback')
        .send({ type: 'api_reply', replies: [{ messageId: 'p-123', message: 'Resposta', from: '11999' }] })
        .expect(201);
      expect(res.body).toEqual({ received: true });
    });
  });
});
