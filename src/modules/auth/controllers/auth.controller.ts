import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { BaseController } from '~/core/bases';
import { SignInPayload, SignUpPayload } from '../models';
import { AuthService } from '../services';

@Controller({
  path: 'auth',
  version: '1.0',
})
export class AuthController extends BaseController {
  constructor(private readonly authService: AuthService) {
    super();
  }

  @Post('signup')
  @HttpCode(HttpStatus.OK)
  async signup(@Body() payload: SignUpPayload) {
    return await this.authService.signUp(payload);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(@Body() payload: SignInPayload) {
    return await this.authService.SignIn(payload);
  }
}
