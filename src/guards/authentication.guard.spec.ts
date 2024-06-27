import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { userRole } from '../modules/User/user-role.enum';
import { PrismaService } from '../prisma/prisma.service';
import { authenticationGuard } from './authentication.guard';

describe('authenticationGuard', () => {
  let guard: authenticationGuard;
  let jwtService: JwtService;
  let prismaService: PrismaService;

  beforeEach(() => {
    jwtService = new JwtService({ secret: process.env.SECRETKEY });
    prismaService = {
      user: {
        findUnique: jest.fn(),
      },
    } as unknown as PrismaService;

    guard = new authenticationGuard(jwtService, prismaService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException if token is missing', async () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: 'InvalidToken',
          },
        }),
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should return true if token is valid and user is found', async () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: `${process.env.BEARER_KEY}validToken`,
          },
        }),
      }),
    } as ExecutionContext;

    jest
      .spyOn(jwtService, 'verify')
      .mockReturnValue({ email: 'test@example.com' });

    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
      userId: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
      address: '123 Test St',
      role: userRole.USER,
    });

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });
});
