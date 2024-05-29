import { Logger, UseGuards } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { User } from "@prisma/client";
import { Server, Socket } from 'socket.io';
import { BusinessException } from "~/core/exceptions";
import { WebSocketGuard } from "~/core/guards";
import { AuthService, SessionService } from "~/modules/auth";
import { UserService } from "~/modules/user";
import { CHANNEL } from "../constants";
import { MessageService, RoomService } from "../services";

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseGuards(WebSocketGuard)
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  private readonly logger: Logger
  private readonly clients: Set<{ clientId: string, userId: number }> = new Set();
  private readonly users: Record<string, User> = {};

  @WebSocketServer()
  private readonly server: Server;
  private readonly defaultRoom = 1
  constructor(
    private readonly sessionService: SessionService,
    private readonly userService: UserService,
    private readonly messageService: MessageService,
    private readonly authService: AuthService,
    private readonly roomService: RoomService
  ) {
    this.logger = new Logger(ChatGateway.name);
  }
  afterInit() {
    this.logger.debug("Socket Initialized");
  }

  async handleConnection(client: Socket) {
    const { sockets } = this.server.sockets;
    if (!client.handshake.headers?.authorization)
      return client.disconnect()

    const verify = await this.sessionService.validateSession(
      client.handshake.headers?.authorization?.split(' ')[1],
    );

    if (!verify?.verified)
      return client.disconnect()

    this.logger.debug(`Client id: ${client.id} connected`);
    this.logger.debug(`Number of connected clients: ${sockets.size}`);
  }

  handleDisconnect(client: Socket) {
    if (!client?.request?.context) return
    const clientData = {
      clientId: client.id,
      userId: client.request.context.userId
    }
    if (this.clients.has(clientData)) {
      this.clients.delete(clientData);
      client.leave(this.defaultRoom.toString());
    }
    this.logger.debug(`Cliend id:${client.id} disconnected`);
  }

  private async getCurrentUser(client: Socket) {

    let user: User
    if (this.users[client.request.context.userId]) {
      user = this.users[client.request.context.userId]
    } else {
      user = await this.userService.getById(client.request.context.userId)
      this.users[client.request.context.userId] = user
    }
    return {
      ...user,
      fullName: (() => {
        if (!user.firstName && !user.lastName)
          return user.username
        return user.firstName + ' ' + user.lastName
      })()
    }
  }
  @UseGuards(WebSocketGuard)
  @SubscribeMessage(CHANNEL.MESSAGE)
  async message(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: string
  ) {
    const user = await this.getCurrentUser(client)
    this.server.to(this.defaultRoom.toString()).emit(CHANNEL.MESSAGE, {
      message,
      sender: user.fullName
    });

    await this.messageService.create({
      roomId: this.defaultRoom,
      senderId: user.id,
      message
    })

    this.server.to(this.defaultRoom.toString()).emit(CHANNEL.NOTICE, {
      action: 'SENT_MESSAGE',
      client: user.fullName
    })
  }

  @UseGuards(WebSocketGuard)
  @SubscribeMessage(CHANNEL.JOIN)
  async joinChannel(
    @ConnectedSocket() client: Socket,
  ) {
    const user = await this.getCurrentUser(client)
    const clientData = {
      clientId: client.id,
      userId: client.request.context.userId
    }
    if (this.clients.has(clientData)) return

    this.clients.add(clientData);
    this.roomService.join({
      userId: user.id,
      id: this.defaultRoom
    })
    client.join(this.defaultRoom.toString());

    // TODO if we need to create a new channel we can implement here

    this.server.to(this.defaultRoom.toString()).emit(CHANNEL.NOTICE, {
      action: 'JOIN',
      client: user.fullName
    })
  }

  @SubscribeMessage(CHANNEL.SIGN_UP)
  async identity(@MessageBody() data: string) {
    if (!data) return `Message Body is empty`;
    let input
    try {
      input = JSON.parse(data)
    } catch {
      return `Message Body should be json format`;
    }
    if (!input) return `Message Body is empty`;
    if (!input.username || !input.password) return `Username or Password is empty`;

    return await this.authService.signUp({
      username: input.username,
      firstName: input.firstName,
      lastName: input.lastName,
      password: input.password
    }).catch((ex: BusinessException) => {
      return ex.err
    })
  }

  @SubscribeMessage(CHANNEL.SIGN_IN)
  async signIn(@MessageBody() data: string) {
    if (!data) return `Message Body is empty`;
    let input
    try {
      input = JSON.parse(data)
    } catch {
      return `Message Body should be json format`;
    }

    if (!input) return `Message Body is empty`;
    if (!input.username || !input.password) return `Username or Password is empty`;

    return await this.authService.SignIn({
      username: input.username,
      password: input.password
    }).catch((ex: BusinessException) => {
      return ex.err
    })
  }
  @UseGuards(WebSocketGuard)
  @SubscribeMessage(CHANNEL.NOTICE)
  async notice() {
    // TOOD we can add handler for each notice event
  }
}