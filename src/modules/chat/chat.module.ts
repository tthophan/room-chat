import { Module } from '@nestjs/common';
import { MessageController, RoomController } from './controllers';
import { ChatGateway } from './gateway';
import { MessageService, RoomService } from './services';

@Module({
  imports: [],
  controllers: [RoomController, MessageController],
  providers: [ChatGateway, RoomService, MessageService],
  exports: [],
})
export class ChatModule {}
