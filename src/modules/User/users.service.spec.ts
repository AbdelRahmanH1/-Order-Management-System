import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { userRole } from './user-role.enum';
import { SignupDTO } from './userDTO/signup.dto';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn().mockImplementation((args) => {
        if (args.where.email === 'ahmed@gmail.com') {
          return { email: 'ahmed@gmail.com' };
        } else {
          return null;
        }
      }),
      create: jest.fn().mockImplementation((data) => {
        return { userId: 1, ...data.data };
      }),
    },
    cart: {
      create: jest.fn().mockImplementation(() => {
        return { userId: 1 };
      }),
    },
    order: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
        JwtService,
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('SignUp Function', () => {
    it('Should Create User', async () => {
      const mockUser = { userId: 1 };
      mockPrismaService.user.findUnique.mockReturnValueOnce(null);
      mockPrismaService.user.create.mockResolvedValueOnce(mockUser);
      mockPrismaService.cart.create.mockReturnValueOnce(mockUser);

      const newUser: SignupDTO = {
        name: 'Ahmed',
        email: 'ahmed@gmail.com',
        password: 'secret123',
        address: 'Alexandria,Egypt',
      };
      const result = await service.signUp(newUser);
      expect(result.success).toBe(true);
      expect(result.message).toBe('User created successfully!');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: newUser.email },
      });
      expect(mockPrismaService.cart.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
        },
      });
    });
    it('throws a ConflictException if user already exists', async () => {
      mockPrismaService.user.findUnique.mockReturnValueOnce({
        email: 'existing@user.com',
      });

      const newUser: SignupDTO = {
        name: 'Ahmed',
        email: 'existing@user.com',
        password: 'secret123',
        address: 'Alexandria,Egypt',
      };

      await expect(service.signUp(newUser)).rejects.toThrowError(
        ConflictException,
      );
    });
  });

  describe('Login Function', () => {
    it('should login user with valid credentials', async () => {
      const mockUser = {
        email: 'existing@user.com',
        password:
          '$2b$08$SZr94ZwsRAcuCrUI1H.8pOBgMNryIcrUqYb1Xk/ertIEqJV3OayVa',
      };

      mockPrismaService.user.findUnique.mockReturnValueOnce(mockUser);

      const loginDto = {
        email: mockUser.email,
        password: '123456',
      };

      const result = await service.login(loginDto);
      expect(result.success).toBe(true);
      expect(result.token).toEqual(expect.any(String));
    });
    it('Shoud Return User not found', async () => {
      const loginDto = {
        email: 'nonexistent@user.com',
        password: 'anyPassword',
      };

      mockPrismaService.user.findUnique.mockReturnValueOnce(null);

      await expect(service.login(loginDto)).rejects.toThrowError(
        'User not found',
      );
    });
    it('Should Return User not found', async () => {
      const loginDto = {
        email: 'nonexistent@user.com',
        password: 'anyPassword',
      };

      mockPrismaService.user.findUnique.mockReturnValueOnce(loginDto);

      await expect(service.login(loginDto)).rejects.toThrowError(
        'Invalid Password',
      );
    });
  });

  describe('OrderHistory Function', () => {
    it('should return order history for ADMIN', async () => {
      const mockOrders = [
        {
          orderId: 1,
          products: [],
          user: { name: 'User 1', email: 'user1@example.com' },
          orderDate: new Date(),
          status: 'PENDING',
          totalPrice: Math.floor(Math.random() * 1000),
        },
        {
          orderId: 2,
          products: [],
          user: { name: 'User 2', email: 'user2@example.com' },
          orderDate: new Date(),
          status: 'COMPLETED',
          totalPrice: Math.floor(Math.random() * 1000),
        },
        {
          orderId: 3,
          products: [],
          user: { name: 'User 3', email: 'user3@example.com' },
          orderDate: new Date(),
          status: 'PENDING',
          totalPrice: Math.floor(Math.random() * 1000),
        },
      ];

      mockPrismaService.order.findMany.mockResolvedValueOnce(mockOrders);

      const req = { user: { role: userRole.ADMIN, userId: 1 } };
      const result = await service.orderHistory(1, req);

      expect(result.success).toBe(true);
      expect(result.result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ totalPrice: expect.any(Number) }),
        ]),
      );
      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: {
          products: { include: { product: true } },
          user: true,
        },
      });
    });

    it('should return order history for USER', async () => {
      const mockOrders = [
        {
          orderId: 1,
          products: [],
          user: {
            name: 'Test User',
            email: 'testuser@example.com',
          },
          orderDate: new Date(),
          status: 'PENDING',
          totalPrice: 100,
        },
      ];
      mockPrismaService.order.findMany.mockResolvedValueOnce(mockOrders);

      const req = { user: { role: 'USER', userId: 1 } };
      const result = await service.orderHistory(1, req);

      expect(result.success).toBe(true);
      expect(result.result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ totalPrice: expect.any(Number) }),
        ]),
      );
      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: {
          products: { include: { product: true } },
          user: true,
        },
      });
    });
    it("should throw ForbiddenException for USER accessing another user's order history", async () => {
      const req = { user: { role: userRole.USER, userId: 2 } };

      await expect(service.orderHistory(1, req)).rejects.toThrowError(
        ForbiddenException,
      );
    });
    it('should throw NotFoundException if no orders found', async () => {
      mockPrismaService.order.findMany.mockResolvedValueOnce([]);

      const req = { user: { role: userRole.USER, userId: 1 } };

      await expect(service.orderHistory(1, req)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });
});
