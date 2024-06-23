import {
  Body,
  Controller,
  Delete,
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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ResponseInterface } from 'src/Interfaces/response.interface';
import { authenticationGuard } from 'src/guards/authentication.guard';
import { authorizationGuard } from 'src/guards/authorization.guard';
import { failedResponse } from 'src/swaggerResponse/failed.response';
import { orderDetailsResponse } from 'src/swaggerResponse/orderDetails.response';
import { successResponse } from 'src/swaggerResponse/success.response';
import { userRole } from 'src/users/user-role.enum';
import { CartService } from './cart.service';
import { AddCartDTO } from './cartDTO/addCart.dto';
import { RemoveCartDTO } from './cartDTO/removeCart.dto';

@ApiTags('Cart APIs')
@Controller('api/cart')
export class CartController {
  constructor(private readonly _cartService: CartService) {}

  @ApiCreatedResponse({
    description: 'Product added in Cart',
    schema: successResponse,
  })
  @ApiBadRequestResponse({
    description: 'Product not found',
    schema: failedResponse,
  })
  @ApiConflictResponse({
    description: 'Something went wrong! Contact the support',
    schema: failedResponse,
  })
  @Post('add')
  @UseGuards(authenticationGuard)
  addToCart(
    @Req() req: Request,
    @Body() body: AddCartDTO,
  ): Promise<ResponseInterface> {
    return this._cartService.addToCart(body, req);
  }

  @ApiOkResponse({
    description: 'Product quantity updated successfully.',
    schema: successResponse,
  })
  @ApiBadRequestResponse({
    description: 'Product not found',
    schema: failedResponse,
  })
  @ApiConflictResponse({
    description: 'Product is not in the cart',
    schema: failedResponse,
  })
  @Put('update')
  @UseGuards(authenticationGuard)
  updateCart(
    @Req() req: Request,
    @Body() body: AddCartDTO,
  ): Promise<ResponseInterface> {
    return this._cartService.updateCart(body, req);
  }

  @ApiOkResponse({
    description: 'Product removed successfully',
    schema: successResponse,
  })
  @ApiNotFoundResponse({
    description: 'Product not found in cart',
    schema: failedResponse,
  })
  @ApiConflictResponse({
    description: 'Something went wrong! Contact the support ',
    schema: failedResponse,
  })
  @Delete('remove')
  @UseGuards(authenticationGuard)
  removeFromCart(
    @Req() req: Request,
    @Body() body: RemoveCartDTO,
  ): Promise<any> {
    return this._cartService.removeFromCart(body, req);
  }

  @ApiOkResponse({
    description: 'Cart details',
    schema: orderDetailsResponse,
  })
  @ApiConflictResponse({
    description: 'User not found ',
    schema: failedResponse,
  })
  @Get(':userId')
  @UseGuards(authenticationGuard, new authorizationGuard([userRole.ADMIN]))
  viewCart(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<ResponseInterface> {
    return this._cartService.viewCart(userId);
  }
}
