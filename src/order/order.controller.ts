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
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ResponseInterface } from 'src/Interfaces/response.interface';
import { authenticationGuard } from 'src/guards/authentication.guard';
import { authorizationGuard } from 'src/guards/authorization.guard';
import { discountResponse } from 'src/swaggerResponse/discount.response';
import { failedResponse } from 'src/swaggerResponse/failed.response';
import { successResponse } from 'src/swaggerResponse/success.response';
import { viewCartResponse } from 'src/swaggerResponse/viewCart.response';
import { userRole } from 'src/users/user-role.enum';
import { OrderService } from './order.service';
import { ApplyCouponDTO } from './orderDTO/applyCoupon.dto';
import { StatusDTO } from './orderDTO/status.dto';

@ApiTags('Order APIs')
@Controller('api/orders')
export class OrderController {
  constructor(private readonly _OrderService: OrderService) {}

  @ApiCreatedResponse({
    description: 'User Created Order',
    schema: successResponse,
  })
  @ApiBadRequestResponse({
    description: 'Cart is Empty',
    schema: failedResponse,
  })
  @Post()
  @UseGuards(authenticationGuard)
  createOrder(@Req() req: Request): Promise<ResponseInterface> {
    return this._OrderService.createOrder(req);
  }

  @ApiOkResponse({ description: 'Status Updated ', schema: successResponse })
  @ApiNotFoundResponse({
    description: 'Order not found',
    schema: failedResponse,
  })
  @Put(':orderId/status')
  @UseGuards(authenticationGuard, new authorizationGuard([userRole.ADMIN]))
  updateOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() body: StatusDTO,
  ): Promise<ResponseInterface> {
    return this._OrderService.updateOrder(body.status, orderId);
  }

  @ApiOkResponse({
    description: "You don't have access to this order",
    schema: viewCartResponse,
  })
  @ApiForbiddenResponse({
    description: "You don't have access to this order",
    schema: failedResponse,
  })
  @ApiNotFoundResponse({
    description: "Order not found'",
    schema: failedResponse,
  })
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

  @ApiCreatedResponse({
    description: 'Apply Discount',
    schema: discountResponse,
  })
  @ApiNotFoundResponse({
    description: 'Coupon not found',
    schema: failedResponse,
  })
  @Post('apply-coupon')
  @UseGuards(authenticationGuard)
  async applyCoupon(
    @Body() body: ApplyCouponDTO,
    @Req() req: any,
  ): Promise<ResponseInterface> {
    return this._OrderService.applyCoupon(body, req);
  }
}
