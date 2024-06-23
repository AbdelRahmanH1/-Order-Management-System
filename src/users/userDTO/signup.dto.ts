import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { userRole } from '../user-role.enum';

export class SignupDTO {
  @ApiProperty({
    type: 'string',
    example: 'John',
    required: true,
  })
  @IsString()
  @MinLength(4, { message: 'Name must be at least 4 characters long' })
  @MaxLength(10, { message: 'Max length is 10' })
  name: string;

  @ApiProperty({
    type: 'string',
    example: 'john@example.com',
    required: true,
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @ApiProperty({ type: 'string', example: '123456', required: true })
  @IsString({ message: 'Password Must be String' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(10, { message: 'Max length is 10' })
  password: string;

  @ApiProperty({
    enum: ['male', 'female'],
    type: 'string',
    default: 'male',
  })
  @IsOptional()
  @IsEnum(['male', 'female'], {
    message: 'Gender must be either "male" or "female"',
  })
  @Transform(({ value }) => value || 'male')
  gender: string;

  @ApiProperty({ example: 'Egypt', type: 'string', required: true })
  @MinLength(10)
  @IsString()
  address: string;

  @ApiProperty({
    type: 'string',
    enum: userRole,
    default: 'USER',
  })
  @IsOptional()
  @IsEnum(userRole)
  role: string;
}
