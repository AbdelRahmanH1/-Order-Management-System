import { IsInt, IsPositive } from 'class-validator';

export class AddCartDTO {
  @IsInt()
  @IsPositive()
  productId: number;

  @IsInt()
  @IsPositive()
  quantity: number;
}
