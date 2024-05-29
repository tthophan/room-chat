import { SetMetadata } from '@nestjs/common';
import { AUTHORIZE } from '../constants';

export const Authorize = () => SetMetadata(AUTHORIZE, true);
