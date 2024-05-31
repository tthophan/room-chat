import {
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BaseController } from '~/core/bases';
import { Authorize } from '~/core/decorators';
import { RoomService } from '../services';

@Controller({
  path: 'rooms',
  version: '1.0',
})
@Authorize()
export class RoomController extends BaseController {
  constructor(
    @Inject(REQUEST)
    private readonly request: Request,
    private readonly roomService: RoomService,
  ) {
    super();
  }

  @Get()
  async getRooms() {
    return await this.roomService.findAll();
  }

  @Post(':id/join')
  async joinRoom(@Param('id', ParseIntPipe) roomId: number) {
    return await this.roomService.join({
      id: roomId,
      userId: this.request.context.userId!,
    });
  }
}
