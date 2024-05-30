import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { AuthModule } from '~/modules/auth';
import { PrismaModule, PrismaService } from '~/modules/prisma';
import { PubsubModule } from '~/modules/pubsub';
import { UserModule } from '~/modules/user';
import { MessageController, RoomController } from '../../controllers';
import { ChatGateway } from '../../gateway';
import { MessageService, RoomService } from '../../services';

describe('RoomService', () => {
  let roomService: RoomService;
  let prismaService: PrismaService;
  beforeEach(async () => {
    jest.resetAllMocks();
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
    }).compile();
    roomService = moduleRef.get<RoomService>(RoomService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
  });
  describe('join', () => {
    it('should join room', async () => {
      const roomId = 1;
      jest.spyOn(prismaService.roomUser, 'upsert').mockResolvedValue({
        id: 1,
      } as any);
      await roomService.join({
        id: roomId,
        userId: 1,
      });
      expect(prismaService.roomUser.upsert).toHaveBeenCalledTimes(1);
      expect(prismaService.roomUser.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: {
            userId: 1,
            roomId,
            createdBy: 1,
          },
          update: {
            userId: 1,
            roomId,
            modifiedBy: 1,
          },
        }),
      );
    });
  });
});
