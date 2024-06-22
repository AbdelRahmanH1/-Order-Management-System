import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ResponseInterface } from 'src/Interfaces/response.interface';
import { authenticationGuard } from 'src/guards/authentication.guard';
import { authorizationGuard } from 'src/guards/authorization.guard';
import { userRole } from 'src/users/user-role.enum';
import { OrderService } from './order.service';
import { StatusDTO } from './orderDTO/status.dto';

@Controller('api/order')
export class OrderController {
  constructor(private readonly _OrderService: OrderService) {}

  @Post()
  @UseGuards(authenticationGuard)
  createOrder(@Req() req: Request): Promise<ResponseInterface> {
    return this._OrderService.createOrder(req);
  }

  @Put(':orderId/status')
  @UseGuards(authenticationGuard, new authorizationGuard([userRole.ADMIN]))
  updateOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() body: StatusDTO,
  ): Promise<ResponseInterface> {
    return this._OrderService.updateOrder(body.status, orderId);
  }

  @Get(':orderId')
  @UseGuards(
    authenticationGuard,
    new authorizationGuard([userRole.ADMIN, userRole.USER]),
  )
  getOrderById(
    @Req() req: Request,
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<ResponseInterface> {
    return this._OrderService.getOrderById(orderId, req);
  }
}
