import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { ResponseInterface } from 'src/Interfaces/response.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { userRole } from 'src/users/user-role.enum';
import { ApplyCouponDTO } from './orderDTO/applyCoupon.dto';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(req: any): Promise<ResponseInterface> {
    const userId = req.user.userId;

    try {
      // 1. Find the user's cart including products
      const cart = await this.prisma.cart.findUnique({
        where: { userId },
        include: { products: true },
      });

      // Check if cart or products are empty
      if (!cart || !cart.products || cart.products.length === 0) {
        throw new BadRequestException('Cart is empty. Cannot create order');
      }

      // 2. Prepare order data from cart products
      const productsInCart = cart.products.map((cartProduct) => ({
        productId: cartProduct.productId,
        quantity: cartProduct.quantity,
      }));

      // 3. Calculate totalPrice for each product
      const productsWithTotalPrice = await Promise.all(
        productsInCart.map(async (product) => {
          const dbProduct = await this.prisma.product.findUnique({
            where: { productId: product.productId },
          });

          if (!dbProduct) {
            throw new Error(`Product with ID ${product.productId} not found`);
          }

          return {
            productId: product.productId,
            quantity: product.quantity,
            price: dbProduct.price,
            totalPrice: product.quantity * dbProduct.price,
          };
        }),
      );

      // 4. Create the order in the database
      const newOrder = await this.prisma.order.create({
        data: {
          userId: userId,
          products: {
            createMany: {
              data: productsWithTotalPrice.map((product) => ({
                productId: product.productId,
                quantity: product.quantity,
                price: product.price,
              })),
            },
          },
        },
        include: {
          products: true,
        },
      });

      // 5. Update product stock after creating the order
      for (const cartProduct of cart.products) {
        await this.prisma.product.update({
          where: { productId: cartProduct.productId },
          data: {
            stock: {
              decrement: cartProduct.quantity,
            },
          },
        });
      }

      // 6. Clear user's cart by deleting cart products
      await this.prisma.cartProduct.deleteMany({
        where: { cartId: cart.cartId },
      });

      return {
        success: true,
        message: 'Order created successfully',
        result: newOrder,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateOrder(
    status: OrderStatus,
    orderId: number,
  ): Promise<ResponseInterface> {
    // 1. Check if the order exists
    const existingOrder = await this.prisma.order.findUnique({
      where: {
        orderId,
      },
    });
    if (!existingOrder) throw new NotFoundException('Order not found');

    // 2. Update the order status
    await this.prisma.order.update({
      where: { orderId },
      data: { status },
    });
    return { success: true, message: `Status Updated to ${status}` };
  }

  async getOrderById(orderId: number, req: any): Promise<ResponseInterface> {
    try {
      let order: any;

      if (req.user.role === userRole.ADMIN) {
        order = await this.prisma.order.findUnique({
          where: { orderId },
          include: {
            products: {
              include: { product: true },
            },
            user: true,
            coupon: true,
          },
        });
      }

      if (req.user.role === userRole.USER) {
        order = await this.prisma.order.findFirst({
          where: { orderId, userId: req.user.userId },
          include: {
            products: {
              include: { product: true },
            },
            user: true,
            coupon: true,
          },
        });

        // If the order is not found or user does not have access
        if (!order) {
          throw new NotFoundException("You don't have access to this order");
        }
      }

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // Calculate total price
      const totalPrice = order.products.reduce((acc, prod) => {
        return acc + prod.quantity * prod.product.price;
      }, 0);

      const finalPrice = order.finalPrice || totalPrice;

      // Format the response with desired fields
      const response: ResponseInterface = {
        success: true,
        result: {
          orderId: order.orderId,
          orderDate: order.orderDate,
          status: order.status,
          user: {
            name: order.user.name,
            email: order.user.email,
          },
          totalPrice: finalPrice,
          products: order.products.map((prod) => ({
            productId: prod.productId,
            productName: prod.product.name,
            quantity: prod.quantity,
            unitPrice: prod.product.price,
            subtotal: prod.quantity * prod.product.price,
          })),
        },
      };

      return response;
    } catch (error) {
      throw error;
    }
  }

  async applyCoupon(
    body: ApplyCouponDTO,
    req: any,
  ): Promise<ResponseInterface> {
    const { orderId, discountNumber } = body;

    try {
      // Find the order
      const order = await this.prisma.order.findUnique({
        where: { orderId },
        include: {
          products: {
            include: { product: true },
          },
          user: true,
          coupon: true,
        },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // Check if the user is the owner of the order or not
      if (order.userId !== req.user.userId) {
        throw new ForbiddenException('You do not have access to this order');
      }

      // Find the coupon
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: discountNumber },
      });

      if (!coupon) {
        throw new NotFoundException('Coupon not found');
      }

      // Calculate the discount
      const discount = coupon.discount;
      const totalPrice = order.products.reduce(
        (acc, prod) => acc + prod.quantity * prod.product.price,
        0,
      );
      const discountedPrice = totalPrice - discount;

      // Ensure the discounted price is not negative
      const finalPrice = Math.max(discountedPrice, 0);

      // Update the order with the discounted price and coupon
      await this.prisma.order.update({
        where: { orderId },
        data: {
          couponId: coupon.couponId,
          finalPrice: finalPrice,
        },
      });

      // Fetch the updated order again to ensure consistency
      const updatedOrder = await this.prisma.order.findUnique({
        where: { orderId },
        include: {
          products: {
            include: { product: true },
          },
          user: true,
          coupon: true,
        },
      });

      if (!updatedOrder) {
        throw new NotFoundException('Updated order not found');
      }

      // Format the response
      const response: ResponseInterface = {
        success: true,
        result: {
          orderId: updatedOrder.orderId,
          orderDate: updatedOrder.orderDate,
          status: updatedOrder.status,
          user: {
            name: updatedOrder.user.name,
            email: updatedOrder.user.email,
          },
          totalPrice: finalPrice,
          discountApplied: discount,
          products: updatedOrder.products.map((prod) => ({
            productId: prod.productId,
            productName: prod.product.name,
            quantity: prod.quantity,
            unitPrice: prod.product.price,
            subtotal: prod.quantity * prod.product.price,
          })),
        },
      };

      return response;
    } catch (error) {
      throw error;
    }
  }
}
