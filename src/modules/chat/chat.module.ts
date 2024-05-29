import { Module } from '@nestjs/common';
import { ChatGateway } from './gateway';
import { ConversationController, RoomController } from './controllers';
import { MessageService, RoomService } from './services';

@Module({
  imports: [],
  controllers: [RoomController, ConversationController],
  providers: [ChatGateway, RoomService, MessageService],
  exports: [],
})
export class ChatModule {}
