import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { authenticationGuard } from 'src/guards/authentication.guard';
import { CartService } from './cart.service';
import { AddCartDTO } from './cartDTO/addCart.dto';

@Controller('api/cart')
export class CartController {
  constructor(private readonly _cartService: CartService) {}

  @Post('add')
  @UseGuards(authenticationGuard)
  addProduct(@Req() req: Request, @Body() body: AddCartDTO) {
    return this._cartService.addProduct(body, req);
  }
}
