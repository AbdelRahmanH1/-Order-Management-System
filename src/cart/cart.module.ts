import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  imports: [],
  controllers: [CartController],
  providers: [CartService, PrismaService, JwtService],
})
export class CartModule {}
