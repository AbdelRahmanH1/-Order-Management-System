import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDTO {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsString({ message: 'Password Must be String' })
  @MinLength(6, { message: "Password must be at least 6 characters long'" })
  password: string;
}
