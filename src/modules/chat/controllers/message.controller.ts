import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Sse,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Request } from 'express';
import { fromEvent, map } from 'rxjs';
import { BaseController } from '~/core/bases';
import { Authorize } from '~/core/decorators';
import { CreateMessagePayload, FetchMessageQuery } from '../models';
import { MessageService } from '../services';

@Controller({
  path: 'rooms/:roomId/messages',
  version: '1.0',
})
@Authorize()
export class MessageController extends BaseController {
  constructor(
    @Inject(REQUEST)
    private readonly request: Request,
    private readonly messageService: MessageService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }
  @Get()
  async fetch(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Query() query: FetchMessageQuery,
  ) {
    return await this.messageService.fetch({
      cursor: query.cursor,
      limit: query.limit,
      roomId: roomId,
    });
  }

  @Post()
  async chat(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Body() payload: CreateMessagePayload,
  ) {
    await this.messageService.create({
      message: payload.message,
      roomId,
      senderId: this.request.context.userId!,
    });
  }
  @Delete(':id')
  async delete(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.messageService.delete({
      roomId,
      id,
      senderId: this.request.context.userId!,
    });
  }
  @Sse('listen')
  async data(@Param('roomId', ParseIntPipe) roomId: number) {
    return fromEvent(this.eventEmitter, roomId.toString()).pipe(
      map((data) => {
        return { data };
      }),
    );
  }
}
