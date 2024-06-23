import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, MinLength } from 'class-validator';

export class ApplyCouponDTO {
  @ApiProperty({ example: 1, required: true })
  @IsInt()
  orderId: number;

  @ApiProperty({ required: true, example: 'aldfuo' })
  @IsString()
  @MinLength(6)
  discountNumber: string;
}
