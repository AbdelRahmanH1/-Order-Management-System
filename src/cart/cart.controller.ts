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
  ApiOperation,
  ApiSecurity,
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

  // add products to cart
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
  @ApiOperation({
    summary: 'Add Product to Cart',
    description: 'must get the productId to save it in cart',
  })
  @ApiSecurity('customToken')
  @Post('add')
  @UseGuards(authenticationGuard)
  addToCart(
    @Req() req: Request,
    @Body() body: AddCartDTO,
  ): Promise<ResponseInterface> {
    return this._cartService.addToCart(body, req);
  }

  // Update cart
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
  @ApiSecurity('customToken')
  @ApiOperation({
    summary: 'Update quantity of product in the cart ',
    description:
      'User add the productId and the quantity that he want to add it to save it in database',
  })
  @Put('update')
  @UseGuards(authenticationGuard)
  updateCart(
    @Req() req: Request,
    @Body() body: AddCartDTO,
  ): Promise<ResponseInterface> {
    return this._cartService.updateCart(body, req);
  }

  //Delete Product from cart
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
  @ApiSecurity('customToken')
  @ApiOperation({
    summary: 'Delete Product from Cart',
    description: 'User can delete the cart using CartId',
  })
  @Delete('remove')
  @UseGuards(authenticationGuard)
  removeFromCart(
    @Req() req: Request,
    @Body() body: RemoveCartDTO,
  ): Promise<any> {
    return this._cartService.removeFromCart(body, req);
  }

  // View Cart
  @ApiOkResponse({
    description: 'Cart details',
    schema: orderDetailsResponse,
  })
  @ApiConflictResponse({
    description: 'User not found ',
    schema: failedResponse,
  })
  @ApiSecurity('customToken')
  @ApiOperation({
    summary: 'View Cart details',
    description:
      'User or admin can access to see the cart Details using cartId',
  })
  @Get(':userId')
  @UseGuards(
    authenticationGuard,
    new authorizationGuard([userRole.ADMIN, userRole.USER]),
  )
  viewCart(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<ResponseInterface> {
    return this._cartService.viewCart(userId);
  }
}
