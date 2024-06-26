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
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ResponseInterface } from '../../Interfaces/response.interface';
import { authenticationGuard } from '../../guards/authentication.guard';
import { authorizationGuard } from '../../guards/authorization.guard';
import { discountResponse } from '../../swaggerResponse/discount.response';
import { failedResponse } from '../../swaggerResponse/failed.response';
import { successResponse } from '../../swaggerResponse/success.response';
import { viewCartResponse } from '../../swaggerResponse/viewCart.response';
import { userRole } from '../User/user-role.enum';
import { OrderService } from './order.service';
import { ApplyCouponDTO } from './orderDTO/applyCoupon.dto';
import { StatusDTO } from './orderDTO/status.dto';

@ApiTags('Order APIs')
@Controller('api/orders')
export class OrderController {
  constructor(private readonly _OrderService: OrderService) {}

  //Create order
  @ApiCreatedResponse({
    description: 'User Created Order',
    schema: successResponse,
  })
  @ApiBadRequestResponse({
    description: 'Cart is Empty',
    schema: failedResponse,
  })
  @ApiSecurity('customToken')
  @ApiOperation({
    summary: 'Create Order in Cart',
    description:
      'this endpoint need the token to detect the user then get the products from cart and make order',
  })
  @Post()
  @UseGuards(authenticationGuard)
  createOrder(@Req() req: Request): Promise<ResponseInterface> {
    return this._OrderService.createOrder(req);
  }

  //Update the status' order
  @ApiOkResponse({ description: 'Status Updated ', schema: successResponse })
  @ApiNotFoundResponse({
    description: 'Order not found',
    schema: failedResponse,
  })
  @ApiSecurity('customToken')
  @ApiOperation({
    summary: 'Change the status of the order for **ADMINS ONLY**',
    description:
      'Admin can input the orderId and change the status of any order',
  })
  @Put(':orderId/status')
  @UseGuards(authenticationGuard, new authorizationGuard([userRole.ADMIN]))
  updateOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() body: StatusDTO,
  ): Promise<ResponseInterface> {
    return this._OrderService.updateOrder(body.status, orderId);
  }

  // Get order Details
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
  @ApiSecurity('customToken')
  @ApiOperation({
    summary: 'Get The order details',
    description: "need input to get the User's Order details",
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

  // Apply Coupon
  @ApiCreatedResponse({
    description: 'Apply Discount',
    schema: discountResponse,
  })
  @ApiNotFoundResponse({
    description: 'Coupon not found',
    schema: failedResponse,
  })
  @ApiSecurity('customToken')
  @ApiOperation({
    summary: 'Apply Coupon on the order',
    description:
      'Need code of coupon to apply the coupon and make the discount',
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
