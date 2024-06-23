import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class RemoveCartDTO {
  @ApiProperty({ example: 1, required: true })
  @IsInt()
  @IsPositive()
  productId: number;
}
