import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { authenticationGuard } from '../../guards/authentication.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatuss } from './order-role.enum';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { ApplyCouponDTO } from './orderDTO/applyCoupon.dto';
import { StatusDTO } from './orderDTO/status.dto';

describe('OrderController', () => {
  let controller: OrderController;
  const mockOrderService = {
    createOrder: jest.fn().mockResolvedValue({
      success: true,
      message: 'Order Created Successfully',
    }),
    updateOrder: jest.fn().mockImplementation(() => ({
      success: true,
      message: `Order Updated Successfully`,
    })),
    getOrderById: jest.fn().mockImplementation((orderId) => ({
      success: true,
      result: {
        orderId,
      },
    })),
    applyCoupon: jest.fn().mockImplementation((body: ApplyCouponDTO) => ({
      success: true,
      result: {
        orderId: body.orderId,
        coupon: body.discountNumber,
      },
    })),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        { provide: OrderService, useValue: mockOrderService },
        {
          provide: authenticationGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        { provide: JwtService, useValue: {} },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('Should Create Order', async () => {
    const mockRequest = {} as Request;
    const result = await controller.createOrder(mockRequest);

    expect(result).toEqual({
      success: true,
      message: 'Order Created Successfully',
    });
    expect(mockOrderService.createOrder).toHaveBeenCalledWith({});
    expect(mockOrderService.createOrder).not.toBeNull();
  });

  it('Should Update Order', async () => {
    const dto: StatusDTO = {
      status: OrderStatuss.PENDING,
    };

    expect(mockOrderService.updateOrder(1, dto));
    expect(mockOrderService.createOrder).toHaveBeenCalledWith({});
    expect(mockOrderService.createOrder).not.toBeNull();
  });

  it('Should Order Details', async () => {
    const request: Request = {} as Request;
    const orderId: number = 1;

    const result = await controller.getOrderById(request, orderId);

    expect(result).toEqual({ success: true, result: { orderId } });
    expect(mockOrderService.getOrderById).toHaveBeenCalledWith(
      orderId,
      request,
    );
    expect(mockOrderService.getOrderById).not.toBeNull();
  });

  it('Should Apply Coupon', async () => {
    const request: Request = {} as Request;
    const body: ApplyCouponDTO = {
      orderId: 1,
      discountNumber: 'qwerty',
    };
    const result = await controller.applyCoupon(body, request);

    expect(result).toEqual({
      success: true,
      result: { orderId: body.orderId, coupon: body.discountNumber },
    });
    expect(mockOrderService.applyCoupon).toHaveBeenCalledWith(body, request);
    expect(mockOrderService.applyCoupon).not.toBeNull();
  });
});
