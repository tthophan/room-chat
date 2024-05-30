import { HttpStatus } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { Socket } from 'socket.io';
import { ERR } from '~/core/enums';
import { BusinessException } from '~/core/exceptions';
import { AuthModule, AuthService, SessionService } from '~/modules/auth';
import { PrismaModule } from '~/modules/prisma';
import { PubsubModule } from '~/modules/pubsub';
import { UserModule, UserService } from '~/modules/user';
import { MessageController, RoomController } from '../../controllers';
import { ChatGateway } from '../../gateway';
import { MessageService, RoomService } from '../../services';

describe('ChatGateway', () => {
  let chatGateway: ChatGateway;
  let sessionService: SessionService;
  let userService: UserService;
  let messageService: MessageService;
  let authService: AuthService;
  let socketClient: Socket;

  beforeEach(async () => {
    jest.resetAllMocks();

    const req = { context: { userId: 1 } };
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
    })
      .overrideProvider(REQUEST)
      .useValue(req)
      .compile();
    chatGateway = moduleRef.get<ChatGateway>(ChatGateway);
    sessionService = moduleRef.get<SessionService>(SessionService);
    userService = moduleRef.get<UserService>(UserService);
    messageService = moduleRef.get<MessageService>(MessageService);
    authService = moduleRef.get<AuthService>(AuthService);

    socketClient = {
      id: 1,
      handshake: {
        headers: {
          authorization: 'Bearer token',
        },
        time: '',
        address: '',
        xdomain: false,
        secure: false,
        issued: 0,
        url: '',
        query: undefined,
        auth: {},
      },
      request: {
        context: null,
      },
      disconnect: jest.fn(),
    } as any;

    Reflect.set(chatGateway, 'server', {
      sockets: {
        sockets: {
          size: 1,
        },
      },
    });
  });
  it('should be defined', () => {
    expect(chatGateway).toBeDefined();
  });

  it('afterInit', () => {
    chatGateway.afterInit();
    expect(chatGateway.afterInit).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should be defined', () => {
      expect(chatGateway.handleConnection).toBeDefined();
    });

    it('handleConnection success', async () => {
      jest.spyOn(sessionService, 'validateSession').mockResolvedValue({
        verified: true,
        data: null,
      });
      await chatGateway.handleConnection(socketClient);
      expect(sessionService.validateSession).toHaveBeenCalledTimes(1);
      expect(sessionService.validateSession).toHaveBeenCalledWith('token');
      expect(socketClient.disconnect).toHaveBeenCalledTimes(0);
    });

    it('handleConnection missing token', async () => {
      socketClient.handshake.headers.authorization = null;
      jest.spyOn(sessionService, 'validateSession').mockResolvedValue({
        verified: true,
        data: null,
      });
      await chatGateway.handleConnection(socketClient);
      expect(socketClient.disconnect).toHaveBeenCalledTimes(1);
      expect(sessionService.validateSession).toHaveBeenCalledTimes(0);
    });
  });

  describe('handleDisconnect', () => {
    it('should be defined', () => {
      expect(chatGateway.handleDisconnect).toBeDefined();
    });
    it('handleDisconnect not exists context', async () => {
      await chatGateway.handleDisconnect(socketClient);
      expect(socketClient.disconnect).toHaveBeenCalledTimes(0);
    });
    it('handleDisconnect context', async () => {
      socketClient.request.context = {
        userId: 1,
      } as any;
      Reflect.set(socketClient, 'id', 1);
      const set = new Set();
      set.add({
        clientId: 1,
        userId: 1,
      });
      socketClient.leave = jest.fn();

      Reflect.set(chatGateway, 'clients', set);

      set.has = jest.fn().mockReturnValue(true);
      await chatGateway.handleDisconnect(socketClient);
      expect(set.has).toHaveBeenCalledTimes(1);
      expect(socketClient.leave).toHaveBeenCalledTimes(1);
      expect(socketClient.disconnect).toHaveBeenCalledTimes(0);
    });
  });

  describe('message', () => {
    it('should be defined', () => {
      expect(chatGateway.message).toBeDefined();
    });
    it('send message', async () => {
      const users = {
        [1]: {
          userId: 1,
          firstname: 'test',
          lastname: 'test',
        },
      };
      socketClient.request.context = {
        userId: 1,
      } as any;
      const server = {
        to: jest.fn().mockReturnValue({
          emit: jest.fn(),
        }),
      };
      jest.spyOn(messageService, 'create').mockResolvedValue({
        id: 1,
      } as any);
      jest.spyOn(userService, 'getById').mockResolvedValue({} as any);
      Reflect.set(chatGateway, 'users', users);
      Reflect.set(chatGateway, 'server', server);
      await chatGateway.message(socketClient, 'message');
      expect(server.to).toHaveBeenCalledTimes(2);
      expect(messageService.create).toHaveBeenCalledTimes(1);
    });
  });
  describe('joinChannel', () => {
    it('should be defined', () => {
      expect(chatGateway.joinChannel).toBeDefined();
    });
    it('joinChannel', async () => {
      jest.spyOn(userService, 'getById').mockResolvedValue({
        username: 'fullName',
        id: 1,
      } as any);
      const server = {
        to: jest.fn().mockReturnValue({
          emit: jest.fn(),
        }),
      };
      socketClient.request.context = {
        userId: 1,
      } as any;
      Reflect.set(socketClient, 'id', 1);
      Reflect.set(chatGateway, 'users', {});

      const clients = {
        has: jest.fn().mockReturnValue(false),
        add: jest.fn(),
      };
      socketClient.join = jest.fn();

      Reflect.set(chatGateway, 'clients', clients);
      Reflect.set(chatGateway, 'server', server);
      await chatGateway.joinChannel(socketClient);
      expect(userService.getById).toHaveBeenCalledTimes(1);
      expect(userService.getById).toHaveBeenCalledWith(1);
      expect(server.to).toHaveBeenCalledTimes(1);
    });
  });

  describe('signUp', () => {
    it('should be defined', () => {
      expect(chatGateway.signUp).toBeDefined();
    });
    it('signUp success', async () => {
      const payload = {
        username: '123',
        password: '123',
      };
      jest.spyOn(authService, 'signUp').mockResolvedValue({} as any);
      await chatGateway.signUp(JSON.stringify(payload));
      expect(authService.signUp).toHaveBeenCalledTimes(1);
      expect(authService.signUp).toHaveBeenCalledWith(
        expect.objectContaining(payload),
      );
    });

    it('signUp fail', async () => {
      const payload = {
        username: '123',
        password: '123',
      };
      jest.spyOn(authService, 'signUp').mockRejectedValue(
        new BusinessException({
          errorCode: ERR.BAD_USER_INPUT,
          err: '',
          status: HttpStatus.BAD_REQUEST,
        }),
      );
      await chatGateway.signUp(JSON.stringify(payload)).catch((ex) => {
        expect(ex).toBeInstanceOf(BusinessException);
      });
      expect(authService.signUp).toHaveBeenCalledTimes(1);
      expect(authService.signUp).toHaveBeenCalledWith(
        expect.objectContaining(payload),
      );
    });
    it('signUp body not json', async () => {
      jest.spyOn(authService, 'signUp').mockResolvedValue({} as any);
      const result = await chatGateway.signUp('a:123');
      expect(result).toEqual(`Message Body should be json format`);
      expect(authService.signUp).toHaveBeenCalledTimes(0);
    });
    it('signUp body empty', async () => {
      jest.spyOn(authService, 'signUp').mockResolvedValue({} as any);
      const result = await chatGateway.signUp(null);
      expect(result).toEqual(`Message Body is empty`);
      expect(authService.signUp).toHaveBeenCalledTimes(0);
    });
    it('signUp body missing field', async () => {
      const payload = {
        username: '123',
      };
      jest.spyOn(authService, 'signUp').mockResolvedValue({} as any);
      const result = await chatGateway.signUp(JSON.stringify(payload));
      expect(result).toEqual(`Username or Password is empty`);
      expect(authService.signUp).toHaveBeenCalledTimes(0);
    });
  });

  describe('signIn', () => {
    it('should be defined', () => {
      expect(chatGateway.signIn).toBeDefined();
    });

    it('signIn success', async () => {
      const payload = {
        username: '123',
        password: '123',
      };
      jest.spyOn(authService, 'SignIn').mockResolvedValue({} as any);
      await chatGateway.signIn(JSON.stringify(payload));
      expect(authService.SignIn).toHaveBeenCalledTimes(1);
      expect(authService.SignIn).toHaveBeenCalledWith(
        expect.objectContaining(payload),
      );
    });

    it('signIn fail', async () => {
      const payload = {
        username: '123',
        password: '123',
      };
      jest.spyOn(authService, 'SignIn').mockRejectedValue(
        new BusinessException({
          errorCode: ERR.BAD_USER_INPUT,
          err: '',
          status: HttpStatus.BAD_REQUEST,
        }),
      );
      await chatGateway.signIn(JSON.stringify(payload)).catch((ex) => {
        expect(ex).toBeInstanceOf(BusinessException);
      });
      expect(authService.SignIn).toHaveBeenCalledTimes(1);
      expect(authService.SignIn).toHaveBeenCalledWith(
        expect.objectContaining(payload),
      );
    });

    it('signIn body not json', async () => {
      jest.spyOn(authService, 'SignIn').mockResolvedValue({} as any);
      const result = await chatGateway.signIn('a:123');
      expect(result).toEqual(`Message Body should be json format`);
      expect(authService.SignIn).toHaveBeenCalledTimes(0);
    });

    it('signIn body empty', async () => {
      jest.spyOn(authService, 'SignIn').mockResolvedValue({} as any);
      const result = await chatGateway.signIn(null);
      expect(result).toEqual(`Message Body is empty`);
      expect(authService.SignIn).toHaveBeenCalledTimes(0);
    });

    it('signIn body missing field', async () => {
      const payload = {
        username: '123',
      };
      jest.spyOn(authService, 'SignIn').mockResolvedValue({} as any);
      const result = await chatGateway.signIn(JSON.stringify(payload));
      expect(result).toEqual(`Username or Password is empty`);
      expect(authService.SignIn).toHaveBeenCalledTimes(0);
    });
  });
});
