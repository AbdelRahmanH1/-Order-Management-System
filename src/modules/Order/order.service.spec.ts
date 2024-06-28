import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { userRole } from '../User/user-role.enum';
import { OrderService } from './order.service';
import { ApplyCouponDTO } from './orderDTO/applyCoupon.dto';

describe('OrderService', () => {
  let service: OrderService;
  const prismaServiceMock = {
    cart: {
      findUnique: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    cartProduct: {
      deleteMany: jest.fn(),
    },
    coupon: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should create an order successfully', async () => {
      const req = { user: { userId: 1 } };

      const mockCart = {
        cartId: 1,
        userId: 1,
        products: [
          { productId: 1, quantity: 2 },
          { productId: 2, quantity: 1 },
        ],
      };

      const mockProducts = [
        { productId: 1, price: 10, stock: 10 },
        { productId: 2, price: 20, stock: 5 },
      ];

      prismaServiceMock.cart.findUnique.mockResolvedValueOnce(mockCart);
      prismaServiceMock.product.findUnique.mockImplementation(
        async ({ where }) => {
          const product = mockProducts.find(
            (p) => p.productId === where.productId,
          );
          return product || null;
        },
      );
      prismaServiceMock.order.create.mockResolvedValueOnce({ id: 1 });

      prismaServiceMock.product.update.mockImplementation(async () => {});

      const result = await service.createOrder(req);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Order created successfully');

      expect(prismaServiceMock.cart.findUnique).toHaveBeenCalledWith({
        where: { userId: req.user.userId },
        include: { products: true },
      });
      expect(prismaServiceMock.product.findUnique).toHaveBeenCalledTimes(2);
      expect(prismaServiceMock.order.create).toHaveBeenCalled();
      expect(prismaServiceMock.cartProduct.deleteMany).toHaveBeenCalled();
      expect(prismaServiceMock.product.update).toHaveBeenCalledTimes(
        mockCart.products.length,
      );
    });

    it('should throw BadRequestException if cart is empty', async () => {
      const req = { user: { userId: 1 } };

      prismaServiceMock.cart.findUnique.mockResolvedValueOnce({ products: [] });

      await expect(service.createOrder(req)).rejects.toThrowError(
        BadRequestException,
      );

      expect(prismaServiceMock.cart.findUnique).toHaveBeenCalledWith({
        where: { userId: req.user.userId },
        include: { products: true },
      });
    });
  });

  describe('updateOrder', () => {
    it('should update order status successfully', async () => {
      const orderId = 1;
      const status: OrderStatus = 'SHIPPED';

      const existingOrder = { orderId: 1, status: 'Pending' };

      prismaServiceMock.order.findUnique.mockResolvedValueOnce(existingOrder);
      prismaServiceMock.order.update.mockResolvedValueOnce({
        ...existingOrder,
        status,
      });

      const result = await service.updateOrder(status, orderId);

      expect(result.success).toBe(true);
      expect(result.message).toBe(`Status Updated to ${status}`);

      expect(prismaServiceMock.order.findUnique).toHaveBeenCalledWith({
        where: { orderId },
      });
      expect(prismaServiceMock.order.update).toHaveBeenCalledWith({
        where: { orderId },
        data: { status },
      });
    });

    it('should throw NotFoundException if order does not exist', async () => {
      const orderId = 2;
      const status: OrderStatus = 'SHIPPED';

      prismaServiceMock.order.findUnique.mockResolvedValueOnce(null);

      await expect(service.updateOrder(status, orderId)).rejects.toThrowError(
        NotFoundException,
      );

      expect(prismaServiceMock.order.findUnique).toHaveBeenCalledWith({
        where: { orderId },
      });
      expect(prismaServiceMock.order.update).toHaveBeenCalled();
    });
  });

  describe('getOrderById', () => {
    it('should get order by id for admin', async () => {
      const orderId = 1;
      const req = { user: { role: userRole.ADMIN } };

      const mockOrder = {
        orderId,
        orderDate: Date.now(),
        products: [
          { quantity: 2, product: { price: 10 } },
          { quantity: 1, product: { price: 20 } },
        ],
        finalPrice: 50,
        user: {},
        coupon: {},
      };

      prismaServiceMock.order.findUnique.mockResolvedValueOnce(mockOrder);

      const result = await service.getOrderById(orderId, req);

      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
    });

    it("should get user's own order by id", async () => {
      const orderId = 1;
      const userId = 1;
      const req = { user: { role: userRole.USER, userId } };

      const mockOrder = {
        orderId,
        orderDate: Date.now(),
        userId,
        products: [
          { quantity: 2, product: { price: 10 } },
          { quantity: 1, product: { price: 20 } },
        ],
        finalPrice: 50,
        user: {},
        coupon: {},
      };

      prismaServiceMock.order.findFirst.mockResolvedValueOnce(mockOrder);

      const result = await service.getOrderById(orderId, req);

      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
    });

    it('should throw ForbiddenException if user tries to access unauthorized order', async () => {
      const orderId = 1;
      const userId = 2;
      const req = { user: { role: userRole.USER, userId } };

      prismaServiceMock.order.findFirst.mockResolvedValueOnce(null);

      await expect(service.getOrderById(orderId, req)).rejects.toThrowError(
        ForbiddenException,
      );

      expect(prismaServiceMock.order.findFirst).toHaveBeenCalledWith({
        where: { orderId, userId },
        include: {
          products: { include: { product: true } },
          user: true,
          coupon: true,
        },
      });
    });

    it('should throw NotFoundException if order does not exist', async () => {
      const orderId = 999;
      const req = { user: { role: userRole.ADMIN } };

      prismaServiceMock.order.findUnique.mockResolvedValueOnce(null);

      await expect(service.getOrderById(orderId, req)).rejects.toThrowError(
        NotFoundException,
      );

      expect(prismaServiceMock.order.findUnique).toHaveBeenCalledWith({
        where: { orderId },
        include: {
          products: { include: { product: true } },
          user: true,
          coupon: true,
        },
      });
    });
  });

  describe('applyCoupon', () => {
    const validCouponCode = 'VALIDCOUPON';
    const orderId = 1;
    const userId = 1;

    const mockOrder = {
      orderId,
      orderDate: Date.now(),
      userId,
      products: [
        { quantity: 2, product: { price: 10 } },
        { quantity: 1, product: { price: 20 } },
      ],
      finalPrice: 30,
      user: {},
      coupon: null,
    };

    it('should apply a valid coupon to the order', async () => {
      const req = { user: { userId } };
      const body: ApplyCouponDTO = { orderId, discountNumber: validCouponCode };

      const mockCoupon = {
        couponId: 1,
        code: validCouponCode,
        discount: 5,
      };

      prismaServiceMock.order.findUnique.mockResolvedValueOnce(mockOrder);
      prismaServiceMock.coupon.findUnique.mockResolvedValueOnce(mockCoupon);
      prismaServiceMock.order.update.mockResolvedValueOnce({
        ...mockOrder,
        couponId: mockCoupon.couponId,
        finalPrice: 25,
      });

      const result = await service.applyCoupon(body, req);

      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
    });

    it('should throw NotFoundException if order does not exist', async () => {
      const req = { user: { userId } };
      const body: ApplyCouponDTO = {
        orderId: 999,
        discountNumber: validCouponCode,
      };

      prismaServiceMock.order.findUnique.mockResolvedValueOnce(null);

      await expect(service.applyCoupon(body, req)).rejects.toThrowError(
        NotFoundException,
      );

      expect(prismaServiceMock.order.findUnique).toHaveBeenCalledWith({
        where: { orderId: body.orderId },
        include: {
          products: { include: { product: true } },
          user: true,
          coupon: true,
        },
      });
    });

    it('should throw NotFoundException if coupon does not exist', async () => {
      const req = { user: { userId } };
      const body: ApplyCouponDTO = { orderId, discountNumber: 'INVALIDCOUPON' };

      prismaServiceMock.order.findUnique.mockResolvedValueOnce(mockOrder);
      prismaServiceMock.coupon.findUnique.mockResolvedValueOnce(null);

      await expect(service.applyCoupon(body, req)).rejects.toThrowError(
        NotFoundException,
      );

      expect(prismaServiceMock.coupon.findUnique).toHaveBeenCalledWith({
        where: { code: body.discountNumber },
      });
    });

    it('should throw ForbiddenException if user does not own the order', async () => {
      const req = { user: { userId: 2 } };
      const body: ApplyCouponDTO = { orderId, discountNumber: validCouponCode };

      prismaServiceMock.order.findUnique.mockResolvedValueOnce(mockOrder);

      await expect(service.applyCoupon(body, req)).rejects.toThrowError(
        ForbiddenException,
      );

      expect(prismaServiceMock.order.findUnique).toHaveBeenCalledWith({
        where: { orderId: body.orderId },
        include: {
          products: { include: { product: true } },
          user: true,
          coupon: true,
        },
      });
    });
  });
});
