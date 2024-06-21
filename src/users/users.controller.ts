import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOAuth2, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { authenticationGuard } from 'src/guards/authentication.guard';
import { LoginDTO } from './userDTO/login.dto';
import { SignupDTO } from './userDTO/signup.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly _UsersServices: UsersService) {}

  @Post('login')
  login(@Body() body: LoginDTO) {
    return this._UsersServices.login(body);
  }

  @Post('signup')
  signUp(@Body() body: SignupDTO): object {
    return this._UsersServices.signUp(body);
  }
  @Get('profile')
  /* @ApiSecurity('Authorisation') */
  @ApiOAuth2(['pets:write'])
  @UseGuards(authenticationGuard)
  profile(@Req() req: Request) {
    return this._UsersServices.profile(req);
  }
}
