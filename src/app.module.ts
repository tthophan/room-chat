import configuration from '@config/configuration';
import { validate } from '@config/validation';
import { CoreExceptionFilter } from '@core/filters';
import { AuthGuard } from '@core/guards';
import {
  CoreResponseInterceptor,
  LoggingInterceptor,
} from '@core/interceptors';
import { RequestContextMiddleware } from '@core/middlewares';
import { AuthModule } from '@modules/auth';
import { HealthModule } from '@modules/health';
import { PrismaModule } from '@modules/prisma';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ChatModule } from './modules/chat';
import { PubsubModule } from './modules/pubsub';
import { UserModule } from './modules/user';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validate,
      validationOptions: {
        abortEarly: true,
      },
    }),
    ServeStaticModule.forRoot({
      serveRoot: '/signin',
      rootPath: join(__dirname, '..', 'public/auth/signin'),
    }),
    ServeStaticModule.forRoot({
      serveRoot: '/signup',
      rootPath: join(__dirname, '..', 'public/auth/signup'),
    }),
    ServeStaticModule.forRoot({
      serveRoot: '',
      rootPath: join(__dirname, '..', 'public/chat'),
    }),
    EventEmitterModule.forRoot(),
    UserModule,
    PubsubModule,
    HealthModule,
    PrismaModule,
    AuthModule,
    ChatModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CoreResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: CoreExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          transform: true,
          whitelist: true,
          validationError: {
            target: false,
            value: false,
          },
          stopAtFirstError: true,
        }),
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
