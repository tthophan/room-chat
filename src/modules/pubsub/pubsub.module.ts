import { Global, Module } from '@nestjs/common';
import { ProducerService } from './services';

@Global()
@Module({
  imports: [],
  exports: [ProducerService],
  providers: [ProducerService],
})
export class PubsubModule {}
