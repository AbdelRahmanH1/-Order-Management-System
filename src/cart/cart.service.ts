import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { ResponseInterface } from 'src/Interfaces/response.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddCartDTO } from './cartDTO/addCart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async addProduct(body: AddCartDTO, req: any): Promise<ResponseInterface> {
    // Check if the product exists and has enough stock
    const product = await this.prisma.product.findUnique({
      where: {
        productId: body.productId,
      },
    });

    if (!product) throw new BadRequestException('Product not found');

    if (product.stock < body.quantity)
      throw new BadRequestException('Insufficient product stock');
    console.log(req.user.userId);

    // Find the user's cart (we assume it always exists)
    const cart = await this.prisma.cart.findUnique({
      where: { userId: req.user.userId },
      include: { products: true },
    });

    if (!cart)
      throw new ConflictException('Something went wrong! Contact the support ');
    // Check if the product is already in the cart

    const cartProduct = await this.prisma.cartProduct.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.cartId,
          productId: body.productId,
        },
      },
    });

    if (cartProduct) {
      // Check if the total quantity exceeds stock
      if (product.stock < cartProduct.quantity + body.quantity)
        throw new BadRequestException(
          'Insufficient product stock for the desired quantity',
        );

      //update Cart
      await this.prisma.cartProduct.update({
        where: {
          cartProductId: cartProduct.cartProductId,
        },
        data: { quantity: cartProduct.quantity + body.quantity },
      });
    } else {
      // Add the product to the cart if it doesn't exist
      await this.prisma.cartProduct.create({
        data: {
          cartId: cart.cartId,
          productId: body.productId,
          quantity: body.quantity,
        },
      });
    }

    //return statement
    return { success: true, message: 'Product added successfully to Cart' };
  }

  async updateCart() {}
}
