import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ResponseInterface } from 'src/Interfaces/response.interface';
import { authenticationGuard } from 'src/guards/authentication.guard';
import { authorizationGuard } from 'src/guards/authorization.guard';
import { userRole } from './user-role.enum';
import { LoginDTO } from './userDTO/login.dto';
import { SignupDTO } from './userDTO/signup.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly _UsersServices: UsersService) {}

  @Post('login')
  login(@Body() body: LoginDTO): Promise<ResponseInterface> {
    return this._UsersServices.login(body);
  }

  @Post('signup')
  signUp(@Body() body: SignupDTO): Promise<ResponseInterface> {
    return this._UsersServices.signUp(body);
  }

  @Get(':userId/orders')
  @UseGuards(
    authenticationGuard,
    new authorizationGuard([userRole.ADMIN, userRole.USER]),
  )
  orderHistory(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: Request,
  ): Promise<ResponseInterface> {
    return this._UsersServices.orderHistory(userId, req);
  }
}
