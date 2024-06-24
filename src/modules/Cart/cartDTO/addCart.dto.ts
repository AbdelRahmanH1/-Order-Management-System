import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class AddCartDTO {
  @ApiProperty({ example: 1, required: true })
  @IsInt()
  @IsPositive()
  productId: number;

  @ApiProperty({ example: 2, required: true })
  @IsInt()
  @IsPositive()
  quantity: number;
}
