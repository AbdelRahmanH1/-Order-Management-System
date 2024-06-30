import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Cart } from '../../Interfaces/models/cart.interface';
import { CartProduct } from '../../Interfaces/models/cartProduct.interface';
import { Product } from '../../Interfaces/models/products.interface';
import { ResponseInterface } from '../../Interfaces/response.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { AddCartDTO } from './cartDTO/addCart.dto';
import { RemoveCartDTO } from './cartDTO/removeCart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async addToCart(body: AddCartDTO, req: any): Promise<ResponseInterface> {
    try {
      // Check if the product exists and has enough stock
      const product: Product = await this.prisma.product.findUnique({
        where: {
          productId: body.productId,
        },
      });

      if (!product) throw new NotFoundException('Product not found');

      if (product.stock < body.quantity)
        throw new BadRequestException('Insufficient product stock');

      // Find the user's cart (we assume it always exists)
      const cart: Cart = await this.prisma.cart.findUnique({
        where: { userId: req.user.userId },
        include: { products: true },
      });

      if (!cart)
        throw new ConflictException(
          'Something went wrong! Contact the support ',
        );
      // Check if the product is already in the cart

      const cartProduct: CartProduct = await this.prisma.cartProduct.findUnique(
        {
          where: {
            cartId_productId: {
              cartId: cart.cartId,
              productId: body.productId,
            },
          },
        },
      );

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
    } catch (error) {
      throw error;
    }
  }

  async updateCart(body: AddCartDTO, req: any): Promise<ResponseInterface> {
    try {
      const { productId, quantity } = body;
      const userId = req.user.userId;

      // 1. Check if the product exists
      const product: Product = await this.prisma.product.findUnique({
        where: { productId: productId },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      // 2. Find the user's cart
      const cart: Cart = await this.prisma.cart.findUnique({
        where: { userId: userId },
        include: { products: true },
      });

      if (!cart) {
        throw new ConflictException('Cart not found');
      }

      // 3. Check if the product is already in the cart
      const cartProduct: CartProduct = await this.prisma.cartProduct.findUnique(
        {
          where: {
            cartId_productId: {
              cartId: cart.cartId,
              productId: productId,
            },
          },
        },
      );

      if (!cartProduct) {
        throw new BadRequestException('Product is not in the cart');
      }

      // Assign quantity directly to newQuantity
      const newQuantity = quantity;

      // 4. Check if the total quantity exceeds stock
      if (product.stock < newQuantity) {
        throw new BadRequestException(
          'Insufficient product stock for the desired quantity',
        );
      }

      // 5. Update the quantity of the product in the cart
      await this.prisma.cartProduct.update({
        where: {
          cartProductId: cartProduct.cartProductId,
        },
        data: {
          quantity: newQuantity,
        },
      });

      return {
        success: true,
        message: 'Product quantity updated successfully.',
      };
    } catch (error) {
      throw error;
    }
  }

  async removeFromCart(
    body: RemoveCartDTO,
    req: any,
  ): Promise<ResponseInterface> {
    try {
      const cart: Cart = await this.prisma.cart.findUnique({
        where: {
          userId: req.user.userId,
        },
        include: { products: true },
      });
      if (!cart)
        throw new ConflictException(
          'Something went wrong! Contact the support ',
        );

      const cartProduct = cart.products.find(
        (p) => p.productId === body.productId,
      );

      if (!cartProduct) {
        throw new NotFoundException('Product not found in cart');
      }
      await this.prisma.cartProduct.delete({
        where: {
          cartProductId: cartProduct.cartProductId,
        },
      });
      return { success: true, message: 'Product removed successfully' };
    } catch (error) {
      throw error;
    }
  }

  async viewCart(userId: number, req: any): Promise<ResponseInterface> {
    try {
      const cart: Cart = await this.prisma.cart.findUnique({
        where: {
          userId: userId,
        },
        include: {
          user: {
            select: {
              userId: true,
              name: true,
              email: true,
            },
          },
          products: {
            include: {
              product: {
                select: {
                  name: true,
                  price: true,
                  description: true,
                },
              },
            },
          },
        },
      });

      // Check if the cart exists
      if (!cart) throw new ConflictException('Cart not found');

      // Check if the user is authorized to access this cart
      if (req.user.role === UserRole.USER && cart.userId !== req.user.userId) {
        throw new ForbiddenException('Unauthorized access to cart');
      }

      // Check if the cart is empty
      if (cart.products.length === 0) {
        return { success: true, message: 'Nothing in Cart' };
      }

      return { success: true, result: cart };
    } catch (error) {
      throw error;
    }
  }
}
