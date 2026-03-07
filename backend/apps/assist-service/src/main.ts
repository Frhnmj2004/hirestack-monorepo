import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Use Socket.IO adapter so extension (socket.io-client) can connect to WebSocket gateway
  app.useWebSocketAdapter(new IoAdapter(app));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URL || 'nats://localhost:4222'],
    },
  });

  await app.startAllMicroservices();
  const port = process.env.PORT ?? 3002;
  await app.listen(port);
}
bootstrap();
