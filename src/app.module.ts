import { Module } from '@nestjs/common';
import { CartModule } from './cart/cart.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, UsersModule, CartModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
