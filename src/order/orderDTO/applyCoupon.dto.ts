import { IsInt, IsString, MinLength } from 'class-validator';

export class ApplyCouponDTO {
  @IsInt()
  orderId: number;

  @IsString()
  @MinLength(6)
  discountNumber: string;
}
