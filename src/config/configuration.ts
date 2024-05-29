import { Configuration } from './configuration.interface';
import { Environment } from './validation';

export default (): Configuration => ({
  env: process.env.NODE_ENV as Environment,
  port: Number(process.env.PORT),
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: Number(process.env.JWT_EXPIRE_IN),
    issuer: process.env.JWT_ISSUER,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    db: Number(process.env.REDIS_DB),
  },
  redisUrl: process.env.REDIS_URL
});
