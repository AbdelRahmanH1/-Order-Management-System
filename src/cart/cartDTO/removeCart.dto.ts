import { IsInt, IsPositive } from 'class-validator';

export class RemoveCartDTO {
  @IsInt()
  @IsPositive()
  productId: number;
}
