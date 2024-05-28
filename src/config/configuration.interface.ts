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
}

export type JWTConfig = Configuration['jwt'];
