import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { IgnoreCoreResponse } from '@core/decorators';

@Controller({
  path: 'healthcheck',
  version: VERSION_NEUTRAL,
})
export class HealthController {
  @Get()
  @IgnoreCoreResponse()
  async check(): Promise<string> {
    return 'ok';
  }
}
