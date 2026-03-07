import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AssistController } from './assist.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ASSIST_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: [process.env.NATS_URL || 'nats://localhost:4222'],
        },
      },
    ]),
  ],
  controllers: [AssistController],
})
export class AssistModule {}
