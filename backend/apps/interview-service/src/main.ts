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
