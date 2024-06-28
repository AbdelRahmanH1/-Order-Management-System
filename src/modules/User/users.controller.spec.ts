import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { ResponseInterface } from 'src/Interfaces/response.interface';
import { authenticationGuard } from '../../guards/authentication.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const mocksUsersServices = {
    signUp: jest.fn().mockResolvedValue({
      success: true,
      message: 'user Created Successfully',
    }),

    login: jest.fn().mockResolvedValue({
      success: true,
      token: 'token',
    }),
    orderHistory: jest.fn().mockResolvedValue({
      success: true,
      results: [{ name: 'object one' }, { name: 'object two' }],
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mocksUsersServices },
        { provide: JwtService, useValue: {} },
        { provide: PrismaService, useValue: {} },
        {
          provide: authenticationGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('SignUp function', () => {
    it('should create a user', async () => {
      const result = await controller.signUp({
        name: 'Ahmed',
        email: 'ahmed@gmail.com',
        password: '12345',
        address: 'alexandria Egypt',
      });
      expect(result).toEqual({
        success: true,
        message: 'user Created Successfully',
      });
      expect(mocksUsersServices.signUp).toHaveBeenCalledWith({
        name: 'Ahmed',
        email: 'ahmed@gmail.com',
        password: '12345',
        address: 'alexandria Egypt',
      });
      expect(mocksUsersServices.signUp).not.toBeNull();
    });
  });

  describe('Login Function', () => {
    it('Should Login the User', async () => {
      const loginDTO = await controller.login({
        email: 'ahmed@gmail.com',
        password: '12345',
      });

      expect(loginDTO).toEqual({
        success: true,
        token: 'token',
      });
      expect(mocksUsersServices.login).toHaveBeenCalledWith({
        email: 'ahmed@gmail.com',
        password: '12345',
      });

      expect(mocksUsersServices.login).not.toBeNull();
    });
  });

  describe('OrderHistory Function', () => {
    it('Should Return User History', async () => {
      const userId = 1;
      const mockRequest = {} as Request;
      const expectedResult: ResponseInterface = {
        success: true,
        results: [{ name: 'object one' }, { name: 'object two' }],
      };

      const result = await controller.orderHistory(userId, mockRequest);
      expect(result).toEqual(expectedResult);
      expect(mocksUsersServices.orderHistory).toHaveBeenCalledWith(
        userId,
        mockRequest,
      );
      expect(mocksUsersServices.orderHistory).not.toBeNull();
    });
  });
});
