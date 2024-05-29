import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Provision = 'provision',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_ISSUER: string;

  @IsNumber()
  JWT_EXPIRE_IN: number;

  @IsString()
  REDIS_HOST: string;

  @IsString()
  REDIS_URL: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  REDIS_PORT: number;

  @IsNumber()
  REDIS_DB: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const message = errors
      .flatMap(({ constraints }) =>
        Object.keys(constraints).flatMap((key) => constraints[key]),
      )
      .join('\n');
    console.error(`ENV Missing:\n${message}`);
    throw new Error('ENV missing');
  }
  return validatedConfig;
}
