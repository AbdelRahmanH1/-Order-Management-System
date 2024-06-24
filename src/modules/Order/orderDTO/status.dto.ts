import { ApiProperty } from '@nestjs/swagger';

import { IsEnum, IsString } from 'class-validator';
import { OrderStatuss } from '../order-role.enum';

export class StatusDTO {
  @ApiProperty({ enum: OrderStatuss, default: 'PENDING' })
  @IsString()
  @IsEnum(OrderStatuss)
  status: OrderStatuss;
}
