import * as path from 'path';
import * as dotenv from 'dotenv';

// Load backend/.env.local — works in both `ts-node` (dev) and `dist/` (prod)
// process.cwd() is always the interview-service directory
const envPath = path.resolve(process.cwd(), '..', '..', '.env.local');
dotenv.config({ path: envPath });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow frontend (Next.js dev) to call the API
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  });

  // All HTTP routes are prefixed with /v1 to match frontend expectations
  app.setGlobalPrefix('v1');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URL || 'nats://localhost:4222'],
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
