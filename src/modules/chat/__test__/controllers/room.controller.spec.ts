import { ConfigModule } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { AuthModule } from '~/modules/auth';
import { PrismaModule } from '~/modules/prisma';
import { PubsubModule } from '~/modules/pubsub';
import { UserModule } from '~/modules/user';
import { MessageController, RoomController } from '../../controllers';
import { ChatGateway } from '../../gateway';
import { MessageService, RoomService } from '../../services';

describe('RoomController', () => {
  let roomService: RoomService;
  let roomController: RoomController;
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

    roomService = moduleRef.get<RoomService>(RoomService);

    roomController = moduleRef.get<RoomController>(RoomController);
  });

  describe('joinRoom', () => {
    it('should join room', async () => {
      const roomId = 1;
      jest.spyOn(roomService, 'join').mockImplementation(async () => {
        return new Promise((resolve) => resolve());
      });
      await roomController.joinRoom(roomId);
      expect(roomService.join).toHaveBeenCalledTimes(1);
      expect(roomService.join).toHaveBeenCalledWith({
        id: roomId,
        userId: 1,
      });
    });
  });
});
