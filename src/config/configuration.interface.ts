import { Environment } from './validation';

export interface SubscriptionConfig {
  subscription: string;
  topic: string;
}
export interface Configuration {
  port: number;
  env: Environment;
  jwt: {
    secret: string;
    issuer: string;
    expiresIn: number;
  };
  redis: {
    host: string
    port: number
    db: number
  },
  redisUrl: string
}

export type JWTConfig = Configuration['jwt'];
export type RedisConfig = Configuration['redis'];
