import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { AuthModule } from '~/modules/auth';
import { PrismaModule, PrismaService } from '~/modules/prisma';
import { ProducerService, PubsubModule } from '~/modules/pubsub';
import { UserModule } from '~/modules/user';
import { MessageController, RoomController } from '../../controllers';
import { ChatGateway } from '../../gateway';
import { MessageService, RoomService } from '../../services';
import { BusinessException } from '~/core/exceptions';

describe('MessageService', () => {
  let prismaService: PrismaService;
  let messageService: MessageService;
  let producerService: ProducerService;
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
    messageService = moduleRef.get<MessageService>(MessageService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    producerService = moduleRef.get<ProducerService>(ProducerService);
  });

  describe('fetch', () => {
    it('should fetch message', async () => {
      const roomId = 1;
      const cursor = 1;
      const limit = 1;
      jest.spyOn(prismaService.message, 'findMany').mockResolvedValue([
        {
          sender: {
            firstName: 'first name',
            lastName: 'last name',
          },
        },
        {
          sender: {
            username: 'test',
          },
        },
      ] as any);
      const result = await messageService.fetch({
        cursor,
        limit,
        roomId,
      });
      expect(result).toBeDefined();
      expect(prismaService.message.findMany).toHaveBeenCalledTimes(1);
      expect(prismaService.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            roomId,
          },
          orderBy: {
            id: Prisma.SortOrder.desc,
          },
          take: Math.min(limit ?? 10, 10),
        }),
      );
    });
    it('should fetch message', async () => {
      const roomId = 1;
      const cursor = 1;
      jest.spyOn(prismaService.message, 'findMany').mockResolvedValue([
        {
          sender: {
            firstName: 'first name',
            lastName: 'last name',
          },
        },
        {
          sender: {
            username: 'test',
          },
        },
      ] as any);
      const result = await messageService.fetch({
        cursor,
        limit: null,
        roomId,
      });
      expect(result).toBeDefined();
      expect(prismaService.message.findMany).toHaveBeenCalledTimes(1);
      expect(prismaService.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            roomId,
          },
          orderBy: {
            id: Prisma.SortOrder.desc,
          },
          take: Math.min(null ?? 10, 10),
        }),
      );
    });
  });

  describe('create', () => {
    it('should create message', async () => {
      const roomId = 1;
      const payload = { message: 'hello' };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
        firstName: '123',
      } as any);
      jest
        .spyOn(prismaService.roomUser, 'findUnique')
        .mockResolvedValue({} as any);
      jest.spyOn(prismaService.message, 'create').mockResolvedValue({} as any);
      jest.spyOn(producerService, 'publishChat').mockResolvedValue({} as any);
      await messageService.create({
        roomId,
        message: payload.message,
        senderId: 1,
      });
      expect(prismaService.message.create).toHaveBeenCalledTimes(1);
      expect(producerService.publishChat).toHaveBeenCalledTimes(1);
      expect(producerService.publishChat).toHaveBeenCalledWith(
        expect.objectContaining({ roomId }),
      );
      expect(prismaService.message.create).toHaveBeenCalledWith({
        data: {
          roomId,
          message: payload.message,
          senderId: 1,
          createdBy: 1,
        },
      });
    });

    it('should create message', async () => {
      const roomId = 1;
      const payload = { message: 'hello' };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({} as any);
      jest
        .spyOn(prismaService.roomUser, 'findUnique')
        .mockResolvedValue({} as any);
      jest.spyOn(prismaService.message, 'create').mockResolvedValue({} as any);
      jest.spyOn(producerService, 'publishChat').mockResolvedValue({} as any);
      await messageService.create({
        roomId,
        message: payload.message,
        senderId: 1,
      });
      expect(prismaService.message.create).toHaveBeenCalledTimes(1);
      expect(producerService.publishChat).toHaveBeenCalledTimes(1);
      expect(producerService.publishChat).toHaveBeenCalledWith(
        expect.objectContaining({ roomId }),
      );
      expect(prismaService.message.create).toHaveBeenCalledWith({
        data: {
          roomId,
          message: payload.message,
          senderId: 1,
          createdBy: 1,
        },
      });
    });

    it('should return for user not found', async () => {
      const roomId = 1;
      const payload = { message: 'hello' };
      jest.spyOn(prismaService.user, 'findUnique').mockReturnValue(null);
      jest
        .spyOn(prismaService.roomUser, 'findUnique')
        .mockReturnValue({} as any);
      await messageService.create({
        roomId,
        message: payload.message,
        senderId: 1,
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });
      expect(prismaService.roomUser.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaService.roomUser.findUnique).toHaveBeenCalledWith({
        where: {
          roomId_userId: {
            roomId,
            userId: 1,
          },
        },
      });
    });

    it('should return for room not found', async () => {
      const roomId = 1;
      const payload = { message: 'hello' };
      jest.spyOn(prismaService.user, 'findUnique').mockReturnValue({} as any);
      jest.spyOn(prismaService.roomUser, 'findUnique').mockReturnValue(null);
      await messageService
        .create({
          roomId,
          message: payload.message,
          senderId: 1,
        })
        .catch((ex) => {
          expect(ex).toBeInstanceOf(BusinessException);
        });
      expect(prismaService.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });

      expect(prismaService.roomUser.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaService.roomUser.findUnique).toHaveBeenCalledWith({
        where: {
          roomId_userId: {
            roomId,
            userId: 1,
          },
        },
      });
    });
  });

  describe('delete', () => {
    it('should delete message', async () => {
      const roomId = 1;
      const messageId = 1;
      jest.spyOn(prismaService.message, 'delete').mockResolvedValue({} as any);
      await messageService.delete({
        roomId,
        id: messageId,
        senderId: 1,
      });
      expect(prismaService.message.delete).toHaveBeenCalledTimes(1);
      expect(prismaService.message.delete).toHaveBeenCalledWith({
        where: {
          id: messageId,
          roomId,
          senderId: 1,
        },
      });
    });

    it('should throw error if message not found', async () => {
      const roomId = 1;
      const messageId = 1;
      jest.spyOn(prismaService.message, 'delete').mockRejectedValue({
        code: 'P2025',
      } as any);
      await messageService
        .delete({
          roomId,
          id: messageId,
          senderId: 1,
        })
        .catch((ex) => {
          expect(ex).toBeInstanceOf(BusinessException);
        });
    });

    it('should throw error', async () => {
      const roomId = 1;
      const messageId = 1;
      jest.spyOn(prismaService.message, 'delete').mockRejectedValue({
        code: 'P2022',
      } as any);
      await messageService
        .delete({
          roomId,
          id: messageId,
          senderId: 1,
        })
        .catch((ex) => {
          expect(ex).not.toBeInstanceOf(BusinessException);
        });
    });
  });
});
