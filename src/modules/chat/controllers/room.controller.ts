import { Body, Controller, Inject, Param, ParseIntPipe, Post } from "@nestjs/common";
import { BaseController } from "~/core/bases";
import { Authorize } from "~/core/decorators";
import { RoomService } from "../services";
import { CreateRoomPayload } from "../models";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";

@Controller({
    path: 'rooms',
    version: '1.0'
})
@Authorize()
export class RoomController extends BaseController {

    constructor(
        @Inject(REQUEST)
        private readonly request: Request,
        private readonly roomService: RoomService
    ) {
        super()
    }

    @Post(':id/join')
    async joinRoom(
        @Param('id', ParseIntPipe) roomId: number
    ) {
        return await this.roomService.join({
            id: roomId,
            userId: this.request.context.userId!
        })
    }
}