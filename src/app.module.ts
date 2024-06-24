import { Module } from '@nestjs/common';
import { CartModule } from './modules/Cart/cart.module';
import { OrderModule } from './modules/Order/order.module';
import { UsersModule } from './modules/User/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, UsersModule, CartModule, OrderModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
