import { Request } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { authenticationGuard } from '../../guards/authentication.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { AddCartDTO } from './cartDTO/addCart.dto';
import { RemoveCartDTO } from './cartDTO/removeCart.dto';

describe('CartController', () => {
  let controller: CartController;
  const mockCartService = {
    addToCart: jest.fn().mockResolvedValue({
      success: true,
      message: 'Products add to cart successfully',
    }),
    updateCart: jest.fn().mockResolvedValue({
      success: true,
      message: 'Cart Updated Successfully',
    }),
    removeFromCart: jest.fn().mockResolvedValue({
      success: true,
      message: 'Cart removed successfully',
    }),
    viewCart: jest.fn().mockImplementation((userId: number) => ({
      success: true,
      result: {
        userId,
      },
    })),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        { provide: CartService, useValue: mockCartService },
        {
          provide: authenticationGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        { provide: JwtService, useValue: {} },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should add product to cart', async () => {
    const request = {} as Request;
    const body: AddCartDTO = {
      productId: 1,
      quantity: 10,
    };
    const result = await controller.addToCart(request, body);
    expect(result).toEqual({
      success: true,
      message: 'Products add to cart successfully',
    });
    expect(mockCartService.addToCart).toHaveBeenCalledWith(body, request);
    expect(mockCartService.addToCart).not.toBeNull();
  });

  it('should update cart', async () => {
    const request = {} as Request;
    const body: AddCartDTO = {
      productId: 1,
      quantity: 10,
    };
    const result = await controller.updateCart(request, body);
    expect(result).toEqual({
      success: true,
      message: 'Cart Updated Successfully',
    });
    expect(mockCartService.updateCart).toHaveBeenCalledWith(body, request);
    expect(mockCartService.updateCart).not.toBeNull();
  });

  it('should delete product from cart', async () => {
    const request = {} as Request;
    const body: RemoveCartDTO = {
      productId: 1,
    };
    const result = await controller.removeFromCart(request, body);
    expect(result).toEqual({
      success: true,
      message: 'Cart removed successfully',
    });
    expect(mockCartService.removeFromCart).toHaveBeenCalledWith(body, request);
    expect(mockCartService.removeFromCart).not.toBeNull();
  });

  it('should show cart info', async () => {
    const request = {} as Request;
    const userId: number = 1;
    const result = await controller.viewCart(userId, request);
    expect(result).toEqual({
      success: true,
      result: {
        userId,
      },
    });
    expect(mockCartService.viewCart).toHaveBeenCalledWith(userId, request);
    expect(mockCartService.viewCart).not.toBeNull();
  });
});
