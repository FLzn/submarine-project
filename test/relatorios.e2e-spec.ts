import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../src/auth/jwt.strategy';
import { RelatoriosController } from '../src/relatorios/relatorios.controller';
import { RelatoriosService } from '../src/relatorios/relatorios.service';
import { PdfService } from '../src/relatorios/pdf.service';
import { TEST_SECRET, makeToken } from './helpers/build-app';

const mockReport = {
  periodo: { start: '2026-01-01', end: '2026-03-31' },
  totais: {
    total: 100,
    total_delivered: 80,
    total_pending: 10,
    total_error: 10,
    valor_total: 24.0,
    taxa_entrega: 80.0,
  },
  por_cliente: [
    {
      cliente_id: 1,
      cliente_nome: 'Empresa X',
      total: 100,
      total_delivered: 80,
      total_pending: 10,
      total_error: 10,
      valor_total: 24.0,
      taxa_entrega: 80.0,
    },
  ],
  evolucao_diaria: [{ data: '2026-01-15', total: 50, total_delivered: 40, total_error: 5 }],
};

const mockRelatoriosService = { getSmsReport: jest.fn().mockResolvedValue(mockReport) };
const mockPdfService = { generateFromHtml: jest.fn().mockResolvedValue(Buffer.from('%PDF-mock')) };

describe('Relatorios (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [PassportModule, JwtModule.register({ secret: TEST_SECRET })],
      controllers: [RelatoriosController],
      providers: [
        { provide: RelatoriosService, useValue: mockRelatoriosService },
        { provide: PdfService, useValue: mockPdfService },
        JwtStrategy,
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
    token = makeToken();
  });

  afterAll(async () => await app.close());

  describe('GET /relatorios/sms', () => {
    it('sem token → 401', () =>
      request(app.getHttpServer()).get('/relatorios/sms').expect(401));

    it('sem startDate → 400', () =>
      request(app.getHttpServer())
        .get('/relatorios/sms?endDate=2026-03-31')
        .set('Authorization', `Bearer ${token}`)
        .expect(400));

    it('sem endDate → 400', () =>
      request(app.getHttpServer())
        .get('/relatorios/sms?startDate=2026-01-01')
        .set('Authorization', `Bearer ${token}`)
        .expect(400));

    it('data inválida → 400', () =>
      request(app.getHttpServer())
        .get('/relatorios/sms?startDate=naoédata&endDate=2026-03-31')
        .set('Authorization', `Bearer ${token}`)
        .expect(400));

    it('startDate maior que endDate → 400', () =>
      request(app.getHttpServer())
        .get('/relatorios/sms?startDate=2026-03-31&endDate=2026-01-01')
        .set('Authorization', `Bearer ${token}`)
        .expect(400));

    it('período válido → 200 com estrutura completa', async () => {
      const res = await request(app.getHttpServer())
        .get('/relatorios/sms?startDate=2026-01-01&endDate=2026-03-31')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('periodo');
      expect(res.body).toHaveProperty('totais');
      expect(res.body).toHaveProperty('por_cliente');
      expect(res.body).toHaveProperty('evolucao_diaria');
      expect(res.body.totais).toHaveProperty('taxa_entrega');
    });
  });

  describe('GET /relatorios/sms/pdf', () => {
    it('sem token → 401', () =>
      request(app.getHttpServer()).get('/relatorios/sms/pdf').expect(401));

    it('sem datas → 400', () =>
      request(app.getHttpServer())
        .get('/relatorios/sms/pdf')
        .set('Authorization', `Bearer ${token}`)
        .expect(400));

    it('período válido → PDF (application/pdf)', async () => {
      const res = await request(app.getHttpServer())
        .get('/relatorios/sms/pdf?startDate=2026-01-01&endDate=2026-03-31')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.headers['content-type']).toMatch(/application\/pdf/);
      expect(res.headers['content-disposition']).toContain('relatorio-sms-2026-01-01-2026-03-31.pdf');
    });
  });
});
