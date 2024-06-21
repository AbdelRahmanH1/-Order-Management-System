import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignupDTO {
  @IsString()
  @MinLength(4, { message: 'Name must be at least 4 characters long' })
  @MaxLength(10, { message: 'Max length is 10' })
  name: string;

  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsString({ message: 'Password Must be String' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(10, { message: 'Max length is 10' })
  password: string;

  @IsOptional()
  @IsEnum(['male', 'female'], {
    message: 'Gender must be either "male" or "female"',
  })
  @Transform(({ value }) => value || 'male')
  gender: string;

  @MinLength(10)
  @IsString()
  address: string;
}
