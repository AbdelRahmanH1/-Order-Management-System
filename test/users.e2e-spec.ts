import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { errorMessage } from '../src/Utils/testing-utils';
import { userRole } from '../src/modules/User/user-role.enum';
import { LoginDTO } from '../src/modules/User/userDTO/login.dto';
import { SignupDTO } from '../src/modules/User/userDTO/signup.dto';
import { UsersModule } from '../src/modules/User/users.module';
import { UsersService } from '../src/modules/User/users.service';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  const fixedTimestamp = 1719686521;

  const mockLoginSuccess = {
    success: true,
    token: process.env.MOCKTOKEN,
  };
  const mockSignUpSucess = {
    success: true,
    message: 'User created successfully!',
  };
  const mockUsersService = {
    login: jest.fn().mockResolvedValue(mockLoginSuccess),
    signUp: jest.fn().mockResolvedValue(mockSignUpSucess),
    orderHistory: jest.fn().mockResolvedValue([]),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue(process.env.MOCKTOKEN),
  };

  beforeAll(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => fixedTimestamp * 1000);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('Login User', () => {
    it.skip('/api/users/login (success)', () => {
      const loginDto: LoginDTO = {
        email: 'ahmed@gmail.com',
        password: '123456',
      };

      return request(app.getHttpServer())
        .post('/api/users/login')
        .send(loginDto)
        .set('Accept', 'application/json')
        .expect(201)
        .expect(mockLoginSuccess);
    });

    it('/api/users/login (validation error)', () => {
      const invalidLoginDto = { email: 'ahmed@gmail.com', password: '123458' };

      return request(app.getHttpServer())
        .post('/api/users/login')
        .send(invalidLoginDto)
        .expect(400)
        .expect(errorMessage(400, 'Bad Request', 'Invalid Password'));
    });
  });

  describe('SignUp', () => {
    it.skip('/api/users/signup (success)', () => {
      const signUp: SignupDTO = {
        email: 'newEmailll@gmail.com',
        password: '123456',
        name: 'Ahmed',
        address: 'Alexandria,Egypt',
      };

      return request(app.getHttpServer())
        .post('/api/users/signup')
        .send(signUp)
        .set('Accept', 'application/json')
        .expect(mockSignUpSucess);
    });
    it('/api/users/signup (failed)', () => {
      const signUp: SignupDTO = {
        email: 'ahmed@gmail.com',
        password: '123456',
        name: 'Ahmed',
        address: 'Alexandria,Egypt',
      };

      return request(app.getHttpServer())
        .post('/api/users/signup')
        .send(signUp)
        .set('Accept', 'application/json')
        .expect(409)
        .expect(errorMessage(409, 'Conflict', 'User already exists!'));
    });
  });

  describe('Order History', () => {
    it.skip('/api/users/order-history (admin access)', async () => {
      const userId = 1;
      const adminToken = await mockJwtService.sign({
        role: userRole.ADMIN,
        userId,
      });

      return request(app.getHttpServer())
        .get(`/api/users/${userId}/orders`)
        .set('Authorization', `${process.env.BEARER_KEY}${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('result');
          expect(res.body.result).toHaveLength(2);
        });
    });

    it.skip('/api/users/order-history (user access)', async () => {
      const userId = 1;
      const userToken = await mockJwtService.sign({
        role: userRole.USER,
        userId,
      });

      return request(app.getHttpServer())
        .get(`/api/users/${userId}/orders`)
        .set('Authorization', `${process.env.BEARER_KEY}${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('result');
          expect(res.body.result).toHaveLength(2);
        });
    });

    it('/api/users/order-history (unauthorized access)', async () => {
      const userId = 3;
      const unauthorizedToken = await mockJwtService.sign({
        role: userRole.USER,
        userId,
      });

      return request(app.getHttpServer())
        .get(`/api/users/${userId}/orders`)
        .set('Authorization', `${process.env.BEARER_KEY}${unauthorizedToken}`)
        .expect(403)
        .expect(
          errorMessage(
            403,
            'Forbidden',
            "You do not have access to this user's order history",
          ),
        );
    });

    it('/api/users/order-history (user not found)', async () => {
      const userId = 999;
      const adminToken = await mockJwtService.sign({
        role: userRole.ADMIN,
        userId,
      });

      return request(app.getHttpServer())
        .get(`/api/users/${userId}/orders`)
        .set('Authorization', `${process.env.BEARER_KEY}${adminToken}`)
        .expect(403)
        .expect(
          errorMessage(
            403,
            'Forbidden',
            "You do not have access to this user's order history",
          ),
        );
    });
  });
  afterAll(async () => {
    await app.close();
  });
});
