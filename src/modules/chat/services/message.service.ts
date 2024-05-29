import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseService } from '~/core/bases';
import { ERR } from '~/core/enums';
import { BusinessException } from '~/core/exceptions';
import { PrismaService } from '~/modules/prisma';
import { ProducerService } from '~/modules/pubsub';
import { CreateMessage, DeleteMessage, MessageParam } from '../types';

@Injectable()
export class MessageService extends BaseService {
  constructor(
    private readonly prismaService: PrismaService,
    private producerService: ProducerService,
  ) {
    super();
  }

  async fetch(query: MessageParam) {
    const { roomId, cursor, limit } = query;
    let condition: Prisma.MessageFindManyArgs = {
      where: {
        roomId: roomId,
      },
      orderBy: {
        id: Prisma.SortOrder.desc,
      },
      take: Math.min(limit ?? 10, 10),
    };
    if (cursor) {
      condition = {
        ...condition,
        cursor: {
          id: cursor,
        },
      };
    }

    const messages = await this.prismaService.message.findMany({
      ...condition,
      include: {
        sender: true,
      },
    });
    return messages.map((message) => {
      return {
        message: message.message,
        sender: (() => {
          if (!message.sender.firstName && !message.sender.lastName)
            return message.sender.username;
          return message.sender.firstName + ' ' + message.sender.lastName;
        })(),
        senderId: message.senderId,
      };
    });
  }

  async create(payload: CreateMessage) {
    const { message, roomId, senderId } = payload;

    const [user, roomUser] = await Promise.all([
      this.prismaService.user.findUnique({
        where: {
          id: senderId,
        },
      }),
      this.prismaService.roomUser.findUnique({
        where: {
          roomId_userId: {
            roomId: roomId,
            userId: senderId,
          },
        },
      }),
    ]);

    if (!user) return;
    if (!roomUser)
      throw new BusinessException({
        errorCode: ERR.NOT_FOUND,
        err: 'You are not a member of this room',
        status: HttpStatus.NOT_FOUND,
      });

    await Promise.all([
      this.prismaService.message.create({
        data: {
          message,
          roomId,
          senderId,
          createdBy: senderId,
        },
      }),
      await this.producerService.publishChat({
        roomId,
        message,
        senderId,
        sender: (() => {
          if (!user.firstName && !user.lastName) return user.username;
          return user.firstName + ' ' + user.lastName;
        })(),
      }),
    ]);
  }

  async delete(payload: DeleteMessage) {
    const { senderId, roomId, id } = payload;
    await this.prismaService.message
      .delete({
        where: {
          senderId,
          roomId,
          id,
        },
      })
      .catch((ex) => {
        if (ex.code === 'P2025')
          throw new BusinessException({
            errorCode: ERR.NOT_FOUND,
            status: HttpStatus.NOT_FOUND,
            err: 'Message not found',
          });
        throw ex;
      });
  }
}
