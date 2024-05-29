import { Injectable } from '@nestjs/common';
import { BaseService } from '~/core/bases';
import { PrismaService } from '~/modules/prisma';
import { JoinRoomParam } from '../types';

@Injectable()
export class RoomService extends BaseService {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async join(payload: JoinRoomParam) {
    const { id, userId } = payload;
    await this.prismaService.roomUser.upsert({
      where: {
        roomId_userId: {
          roomId: id,
          userId,
        },
      },
      create: {
        userId,
        createdBy: userId,
        roomId: id,
      },
      update: {
        userId,
        modifiedBy: userId,
        roomId: id,
      },
    });
  }
}
