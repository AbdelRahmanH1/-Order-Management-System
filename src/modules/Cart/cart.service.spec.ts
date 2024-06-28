import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { CartService } from './cart.service';
import { AddCartDTO } from './cartDTO/addCart.dto';
import { RemoveCartDTO } from './cartDTO/removeCart.dto';

describe('CartService', () => {
  let service: CartService;

  const mockProduct = { productId: 1, stock: 10 };
  const mockCart = {
    cartId: 1,
    userId: 1,
    products: [
      {
        cartProductId: 1,
        cartId: 1,
        productId: 1,
        quantity: 2,
        product: { name: 'Product 1', price: 10, description: 'Description 1' },
      },
      {
        cartProductId: 2,
        cartId: 1,
        productId: 2,
        quantity: 1,
        product: { name: 'Product 2', price: 20, description: 'Description 2' },
      },
    ],
    user: { userId: 1, name: 'Test User', email: 'testuser@example.com' },
  };

  const mockPrismaService = {
    product: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.productId === 1) {
          return mockProduct;
        } else {
          return null;
        }
      }),
    },
    cart: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.userId === mockCart.userId) {
          return mockCart;
        } else {
          return null;
        }
      }),
    },
    cartProduct: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        return mockCart.products.find(
          (p) => p.cartId === where.cartId && p.productId === where.productId,
        );
      }),
      delete: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockImplementation((data) => ({
        ...data,
        cartProductId: mockCart.products.length + 1,
      })),
      update: jest.fn().mockResolvedValue({}),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addToCart', () => {
    it('should add product to cart', async () => {
      const addCartDto: AddCartDTO = {
        productId: 1,
        quantity: 1,
      };
      const req = { user: { userId: 1 } };

      mockPrismaService.product.findUnique.mockResolvedValueOnce(mockProduct);
      mockPrismaService.cart.findUnique.mockResolvedValueOnce(mockCart);

      const result = await service.addToCart(addCartDto, req);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Product added successfully to Cart');
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { productId: addCartDto.productId },
      });
      expect(mockPrismaService.cart.findUnique).toHaveBeenCalledWith({
        where: { userId: req.user.userId },
        include: { products: true },
      });
      expect(mockPrismaService.cartProduct.create).toHaveBeenCalledWith({
        data: {
          cartId: mockCart.cartId,
          productId: addCartDto.productId,
          quantity: addCartDto.quantity,
        },
      });
    });

    it('should throw NotFoundException for non-existing product', async () => {
      const addCartDto: AddCartDTO = {
        productId: 2,
        quantity: 1,
      };
      const req = { user: { userId: 1 } };

      mockPrismaService.product.findUnique.mockResolvedValueOnce(null);

      await expect(service.addToCart(addCartDto, req)).rejects.toThrowError(
        NotFoundException,
      );

      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { productId: addCartDto.productId },
      });
    });

    it('should throw BadRequestException for insufficient stock', async () => {
      const addCartDto: AddCartDTO = {
        productId: 1,
        quantity: 20,
      };
      const req = { user: { userId: 1 } };

      mockPrismaService.product.findUnique.mockResolvedValueOnce(mockProduct);

      await expect(service.addToCart(addCartDto, req)).rejects.toThrowError(
        BadRequestException,
      );

      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { productId: addCartDto.productId },
      });
    });
  });

  describe('updateCart', () => {
    it('should update product quantity in cart', async () => {
      const updateCartDto: AddCartDTO = {
        productId: 1,
        quantity: 2,
      };
      const req = { user: { userId: 1 } };

      mockPrismaService.product.findUnique.mockResolvedValueOnce(mockProduct);
      mockPrismaService.cart.findUnique.mockResolvedValueOnce(mockCart);
      mockPrismaService.cartProduct.findUnique.mockResolvedValueOnce(
        mockCart.products[0],
      );

      const result = await service.updateCart(updateCartDto, req);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Product quantity updated successfully.');
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { productId: updateCartDto.productId },
      });
      expect(mockPrismaService.cart.findUnique).toHaveBeenCalledWith({
        where: { userId: req.user.userId },
        include: { products: true },
      });
      expect(mockPrismaService.cartProduct.update).toHaveBeenCalledWith({
        where: { cartProductId: mockCart.products[0].cartProductId },
        data: { quantity: updateCartDto.quantity },
      });
    });

    it('should throw ConflictException if user cart is not found', async () => {
      const updateCartDto: AddCartDTO = {
        productId: 1,
        quantity: 1,
      };
      const req = { user: { userId: 2 } };

      mockPrismaService.product.findUnique.mockResolvedValueOnce(mockProduct);
      mockPrismaService.cart.findUnique.mockResolvedValueOnce(null);

      await expect(service.updateCart(updateCartDto, req)).rejects.toThrowError(
        ConflictException,
      );

      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { productId: updateCartDto.productId },
      });
      expect(mockPrismaService.cart.findUnique).toHaveBeenCalledWith({
        where: { userId: req.user.userId },
        include: { products: true },
      });
    });

    it('should throw BadRequestException if product is not in the cart', async () => {
      const updateCartDto: AddCartDTO = {
        productId: 2,
        quantity: 1,
      };
      const req = { user: { userId: 1 } };

      mockPrismaService.product.findUnique.mockResolvedValueOnce(mockProduct);
      mockPrismaService.cart.findUnique.mockResolvedValueOnce(mockCart);
      mockPrismaService.cartProduct.findUnique.mockResolvedValueOnce(null);

      await expect(service.updateCart(updateCartDto, req)).rejects.toThrowError(
        BadRequestException,
      );

      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { productId: updateCartDto.productId },
      });
      expect(mockPrismaService.cart.findUnique).toHaveBeenCalledWith({
        where: { userId: req.user.userId },
        include: { products: true },
      });
    });

    it('should throw BadRequestException if quantity exceeds product stock', async () => {
      const updateCartDto: AddCartDTO = {
        productId: 1,
        quantity: 20,
      };
      const req = { user: { userId: 1 } };

      mockPrismaService.product.findUnique.mockResolvedValueOnce(mockProduct);
      mockPrismaService.cart.findUnique.mockResolvedValueOnce(mockCart);
      mockPrismaService.cartProduct.findUnique.mockResolvedValueOnce(
        mockCart.products[0],
      );

      await expect(service.updateCart(updateCartDto, req)).rejects.toThrowError(
        BadRequestException,
      );

      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { productId: updateCartDto.productId },
      });
      expect(mockPrismaService.cart.findUnique).toHaveBeenCalledWith({
        where: { userId: req.user.userId },
        include: { products: true },
      });
    });
  });

  describe('removeFromCart', () => {
    it('should remove product from cart', async () => {
      const removeCartDto: RemoveCartDTO = {
        productId: 1,
      };
      const req = { user: { userId: 1 } };

      mockPrismaService.cart.findUnique.mockResolvedValueOnce(mockCart);

      const result = await service.removeFromCart(removeCartDto, req);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Product removed successfully');
      expect(mockPrismaService.cart.findUnique).toHaveBeenCalledWith({
        where: { userId: req.user.userId },
        include: { products: true },
      });
      expect(mockPrismaService.cartProduct.delete).toHaveBeenCalledWith({
        where: { cartProductId: mockCart.products[0].cartProductId },
      });
    });

    it('should throw ConflictException if user cart is not found', async () => {
      const removeCartDto: RemoveCartDTO = {
        productId: 1,
      };
      const req = { user: { userId: 2 } };

      mockPrismaService.cart.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.removeFromCart(removeCartDto, req),
      ).rejects.toThrowError(ConflictException);

      expect(mockPrismaService.cart.findUnique).toHaveBeenCalledWith({
        where: { userId: req.user.userId },
        include: { products: true },
      });
    });
  });

  describe('viewCart', () => {
    it('should view user cart', async () => {
      const req = { user: { userId: 1 } };

      const result = await service.viewCart(req.user.userId, req);

      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
    });

    it('should throw ConflictException if user cart is not found', async () => {
      const req = { user: { userId: 2 } };

      await expect(service.viewCart(req.user.userId, req)).rejects.toThrowError(
        ConflictException,
      );
    });
  });
});
