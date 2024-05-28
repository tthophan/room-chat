import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Main")
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port');
  // enable graceful shutdown
  app.enableShutdownHooks();
  await app.listen(port);
  logger.log(`Application listen on ${await app.getUrl()}`);
}
bootstrap();
