import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDTO {
  @ApiProperty({
    example: 'john@example.com',
    required: true,
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @ApiProperty({
    example: '123456',
    required: true,
  })
  @IsString({ message: 'Password Must be String' })
  @MinLength(6, { message: "Password must be at least 6 characters long'" })
  password: string;
}
