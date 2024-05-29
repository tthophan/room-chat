import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { Socket } from 'socket.io';
import { SessionService } from "~/modules/auth";
import { CID_HEADER_KEY } from "../constants";
import { RequestContext } from "../models";
import { generateCID } from "../utils";

@Injectable()
export class WebSocketGuard implements CanActivate {
    private readonly logger: Logger
    constructor(private sessionService: SessionService,) {
        this.logger = new Logger(WebSocketGuard.name);
    }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean | any> {
        const client: Socket = context.switchToWs().getClient<Socket>();
        const bearerToken = (client as any).handshake.headers.authorization.split(' ')[1];
        if (!bearerToken) {
            client.disconnect()
            return false
        }

        const session = await this.sessionService.validateSession(bearerToken)
        if (!session?.verified) {
            client.disconnect()
            return false
        }

        const cid =
            client.handshake.headers[CID_HEADER_KEY] ||
            client.handshake.headers[CID_HEADER_KEY.toUpperCase()];

        client.request.context = new RequestContext({
            cid: generateCID(cid ? String(cid) : null),
            requestTimestamp: this.getTimestamp(),
            accessToken: bearerToken,
            userId: session.data.userId
        })
        return true
    }
    getTimestamp = () => new Date().getTime();
}