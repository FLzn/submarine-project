import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe, Type } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import { JwtStrategy } from '../../src/auth/jwt.strategy';

export const TEST_SECRET = 'submarine_e2e_test_secret';

// Setado antes de qualquer instância de JwtStrategy ser criada pelo NestJS
process.env.JWT_SECRET = TEST_SECRET;

export function makeToken(payload: object = { sub: 1, email: 'test@test.com', username: 'test' }): string {
  return jwt.sign(payload, TEST_SECRET);
}

export async function buildApp(
  controller: Type<any>,
  serviceToken: Type<any> | string,
  mockService: object,
): Promise<{ app: INestApplication; token: string }> {
  const module = await Test.createTestingModule({
    imports: [
      PassportModule,
      JwtModule.register({ secret: TEST_SECRET }),
    ],
    controllers: [controller],
    providers: [
      { provide: serviceToken, useValue: mockService },
      JwtStrategy,
    ],
  }).compile();

  const app = module.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  await app.init();

  return { app, token: makeToken() };
}
