import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();
  }
  async onModuleInit() {
    await super.$connect();
  }

  async onModuleDestroy() {
    await super.$disconnect();
  }

  /**
   * @deprecated
   */
  $on(): void {
    throw new Error('Method $on is not available in PrismaService');
  }

  /**
   * @deprecated
   */
  async $disconnect(): Promise<void> {
    throw new Error('Method $disconnect is not available in PrismaService');
  }
}

export default new PrismaService();
