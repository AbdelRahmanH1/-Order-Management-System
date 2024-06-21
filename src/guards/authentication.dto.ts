import { IsString } from 'class-validator';

export class authenticationDTO {
  @IsString()
  token: string;
}
