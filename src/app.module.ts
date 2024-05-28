import configuration from '@config/configuration';
import { validate } from '@config/validation';
import { CoreExceptionFilter } from '@core/filters';
import { CoreResponseInterceptor, LoggingInterceptor } from '@core/interceptors';
import { RequestContextMiddleware } from '@core/middlewares';
import { HealthModule } from '@modules/health';
import { MiddlewareConsumer, Module, NestModule, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
    HealthModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
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
    }
  ],
})
export class AppModule
  implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
