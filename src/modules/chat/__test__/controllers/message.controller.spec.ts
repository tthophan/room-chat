import { ConfigModule } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { Observable } from 'rxjs';
import { AuthModule } from '~/modules/auth';
import { PrismaModule } from '~/modules/prisma';
import { PubsubModule } from '~/modules/pubsub';
import { UserModule } from '~/modules/user';
import { MessageController, RoomController } from '../../controllers';
import { ChatGateway } from '../../gateway';
import { FetchMessageQuery } from '../../models';
import { MessageService, RoomService } from '../../services';

describe('MessageController', () => {
  let messageController: MessageController;
  let messageService: MessageService;
  let eventEmitter2: EventEmitter2;
  beforeEach(async () => {
    jest.resetAllMocks();
    const req = { context: { userId: 1 } };
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        EventEmitterModule.forRoot(),
        AuthModule,
        PrismaModule,
        UserModule,
        PubsubModule,
      ],
      controllers: [RoomController, MessageController],
      providers: [ChatGateway, RoomService, MessageService],
    })
      .overrideProvider(REQUEST)
      .useValue(req)
      .compile();

    messageService = moduleRef.get<MessageService>(MessageService);
    eventEmitter2 = moduleRef.get<EventEmitter2>(EventEmitter2);
    messageController = moduleRef.get<MessageController>(MessageController);
  });

  it('should be defined', () => {
    expect(messageController).toBeDefined();
  });
  describe('fetch', () => {
    it('should fetch messages', async () => {
      const roomId = 1;
      const cursor = 1;
      const limit = 10;
      jest
        .spyOn(messageService, 'fetch')
        .mockReturnValue(new Promise((resolve) => resolve(Array(10))));
      const messages = await messageController.fetch(
        roomId,
        plainToInstance(FetchMessageQuery, { cursor, limit }),
      );
      expect(messages.length).toBe(limit);
    });
  });

  describe('chat', () => {
    it('should create message', async () => {
      const roomId = 1;
      const payload = { message: 'hello' };
      jest
        .spyOn(messageService, 'create')
        .mockReturnValue(new Promise((resolve) => resolve()));
      await messageController.chat(roomId, payload);
      expect(messageService.create).toHaveBeenCalledTimes(1);
      expect(messageService.create).toHaveBeenCalledWith({
        roomId,
        message: payload.message,
        senderId: 1,
      });
    });
  });
  describe('delete', () => {
    it('should delete message', async () => {
      const roomId = 1;
      const messageId = 1;
      jest
        .spyOn(messageService, 'delete')
        .mockReturnValue(new Promise((resolve) => resolve()));
      await messageController.delete(roomId, messageId);
      expect(messageService.delete).toHaveBeenCalledTimes(1);
      expect(messageService.delete).toHaveBeenCalledWith({
        id: messageId,
        senderId: 1,
        roomId,
      });
    });
  });

  it('should return data from event emitter', async () => {
    const roomId = 123; // Set roomId to your desired value
    const testData = { test: 'data' };

    eventEmitter2.emit(roomId.toString(), testData);
    const result = await messageController.data(roomId);

    // Assert that the result is correct
    expect(result).toBeInstanceOf(Observable);
  });
});
