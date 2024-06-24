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
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { authenticationGuard } from 'src/guards/authentication.guard';
import { authorizationGuard } from 'src/guards/authorization.guard';
import { failedResponse } from 'src/swaggerResponse/failed.response';
import { successResponse } from 'src/swaggerResponse/success.response';
import { userHistoryResponse } from 'src/swaggerResponse/userHistory.response';
import { userLoginResponse } from 'src/swaggerResponse/userlogin.response';
import { ResponseInterface } from '../../Interfaces/response.interface';
import { userRole } from './user-role.enum';
import { LoginDTO } from './userDTO/login.dto';
import { SignupDTO } from './userDTO/signup.dto';
import { UsersService } from './users.service';

@ApiTags('Users APIS')
@Controller('api/users')
export class UsersController {
  constructor(private readonly _UsersServices: UsersService) {}

  //Login
  @ApiOkResponse({ description: 'token', schema: userLoginResponse })
  @ApiBadRequestResponse({
    description: 'Validation Error',
    schema: failedResponse,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: failedResponse,
  })
  @ApiOperation({
    summary: 'Login User',
    description: `this endpoint accept email and password then generate token`,
  })
  @Post('login')
  login(@Body() body: LoginDTO): Promise<ResponseInterface> {
    return this._UsersServices.login(body);
  }
  //SignUp
  @ApiCreatedResponse({
    description: 'User Created successfully',
    schema: successResponse,
  })
  @ApiConflictResponse({
    description: 'User already exists! ',
    schema: failedResponse,
  })
  @ApiOperation({
    summary: 'Create New User',
    description: 'this endpoint accept User information to save it in database',
  })
  @Post('signup')
  signUp(@Body() body: SignupDTO): Promise<ResponseInterface> {
    return this._UsersServices.signUp(body);
  }
  //get History'order
  @ApiOkResponse({
    description: "Order's User history",
    schema: userHistoryResponse,
  })
  @ApiForbiddenResponse({
    description: "You do not have access to this user's order history",
    schema: failedResponse,
  })
  @ApiNotFoundResponse({
    description: 'No orders found',
    schema: failedResponse,
  })
  @ApiSecurity('customToken')
  @ApiOperation({
    summary: "get the orders' history for each User",
    description: 'this endpoint accept UserId and get all orders of user',
  })
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
