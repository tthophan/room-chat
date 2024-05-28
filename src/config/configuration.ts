import { Configuration } from './configuration.interface';
import { Environment } from './validation';

export default (): Configuration => ({
  env: process.env.NODE_ENV as Environment,
  port: Number(process.env.PORT),
  jwt: {
    secret: process.env.POS_JWT_SECRET,
    expireIn: Number(process.env.POS_JWT_EXPIRE_IN),
    issuer: process.env.POS_JWT_ISSUER,
  },
});
