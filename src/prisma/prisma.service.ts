import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Prisma connected successfully');
    } catch (error) {
      console.error('Error connecting to Prisma:', error);
      throw error;
    }
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
