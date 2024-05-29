import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { createClient } from 'redis';
import { QUEUES } from "../constants";
import { ChatJobData } from "../types";

@Injectable()
export class ProducerService implements OnModuleInit {
    private readonly redisUrl: string
    private readonly publisher;
    private readonly subscriber;
    constructor(
        private readonly configService: ConfigService,
        private readonly eventEmitter: EventEmitter2
    ) {
        this.redisUrl = configService.get<string>("redisUrl")
        this.publisher = createClient({
            url: this.redisUrl
        })
        this.subscriber = this.publisher.duplicate();
    }
    async onModuleInit() {
        await Promise.all([
            this.subscriber.connect(),
            this.publisher.connect()
        ])

        await this.subscriber.subscribe(QUEUES.CHAT_ROOM, async (message: string) => {
            const data = JSON.parse(message)
            await this.eventEmitter.emitAsync(data.roomId.toString(), {
                message: data.message,
                sender: data.sender,
                senderId: data.senderId
            })
        });
    }

    async publishChat<T extends ChatJobData>(data: T) {
        await this.publisher.publish(QUEUES.CHAT_ROOM, JSON.stringify(data));
    }
}