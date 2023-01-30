import { Module } from '@nestjs/common';
import { ChatGateWay } from './chat2/chat.gateway';


@Module({
  imports: [],
  controllers: [],
  providers: [ChatGateWay],
})
export class AppModule {}
