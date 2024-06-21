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
import { Request } from 'express';
import { ResponseInterface } from 'src/Interfaces/response.interface';
import { authenticationGuard } from 'src/guards/authentication.guard';
import { CartService } from './cart.service';
import { AddCartDTO } from './cartDTO/addCart.dto';
import { RemoveCartDTO } from './cartDTO/removeCart.dto';

@Controller('api/cart')
export class CartController {
  constructor(private readonly _cartService: CartService) {}

  @Post('add')
  @UseGuards(authenticationGuard)
  addToCart(
    @Req() req: Request,
    @Body() body: AddCartDTO,
  ): Promise<ResponseInterface> {
    return this._cartService.addToCart(body, req);
  }

  @Put('update')
  @UseGuards(authenticationGuard)
  updateCart(
    @Req() req: Request,
    @Body() body: AddCartDTO,
  ): Promise<ResponseInterface> {
    return this._cartService.updateCart(body, req);
  }

  @Delete('remove')
  @UseGuards(authenticationGuard)
  removeFromCart(
    @Req() req: Request,
    @Body() body: RemoveCartDTO,
  ): Promise<any> {
    return this._cartService.removeFromCart(body, req);
  }

  @Get(':userId')
  viewCart(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<ResponseInterface> {
    return this._cartService.viewCart(userId);
  }
}
