import { OrderStatus } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class StatusDTO {
  @IsString()
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
