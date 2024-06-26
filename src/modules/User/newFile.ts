import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { authenticationGuard } from '../../guards/authentication.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDTO } from './userDTO/login.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  const mocksUsersServices = {
    signUp: jest.fn().mockResolvedValue({
      success: true,
      message: 'user Created Successfully',
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
  });

  it('Should Login the User', async () => {
    const mockToken = 'mocked.token.string';

    const loginDTO: LoginDTO = {
      email: 'ahmed@gmail.com',
      password: '12345',
    };

    const response = await controller.login(loginDTO);

    expect(response).toEqual({
      success: true,
      token: mockToken,
    });
  });
});
