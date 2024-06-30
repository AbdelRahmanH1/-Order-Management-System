import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ApplyCouponDTO } from 'src/modules/Order/orderDTO/applyCoupon.dto';
import * as request from 'supertest';
import { errorMessage } from '../src/Utils/testing-utils';
import { OrderModule } from '../src/modules/Order/order.module';
import { OrderService } from '../src/modules/Order/order.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const mockOrderService = {
    createOrder: jest.fn().mockResolvedValue({
      success: true,
      message: 'Order created successfully',
    }),
    updateOrder: jest.fn().mockResolvedValue({
      success: true,
      message: 'Status Updated to DELIVERED',
    }),
    getOrderById: jest.fn().mockResolvedValue({
      success: true,
      result: { orderId: 1, finalPrice: 100, products: [] },
    }),
    applyCoupon: jest.fn().mockResolvedValue({
      success: true,
      result: { orderId: 1, finalPrice: 80, discount: 20 },
    }),
  };
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [OrderModule],
      providers: [{ provide: OrderService, useValue: mockOrderService }],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe.skip('createOrder', () => {
    it('/api/orders (POST) - success', () => {
      const userToken = process.env.MOCKTOKEN;

      return request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `${process.env.BEARER_KEY}${userToken}`)
        .expect(201)
        .expect({
          success: true,
          message: 'Order created successfully',
        });
    });

    it.skip('/api/orders (POST) - empty cart', () => {
      const userToken = process.env.MOCKTOKEN;

      return request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `${process.env.BEARER_KEY}${userToken}`)
        .expect(400)
        .expect(
          errorMessage(
            400,
            'Bad Request',
            'Cart is empty. Cannot create order',
          ),
        );
    });
  });

  describe.skip('updateOrder', () => {
    it('/api/orders/:id/status (success)', () => {
      const userToken = process.env.MOCKADMIN;

      return request(app.getHttpServer())
        .put('/api/orders/1/status')
        .send({ status: 'DELIVERED' })
        .set('Authorization', `${process.env.BEARER_KEY}${userToken}`)
        .expect(200)
        .expect({
          success: true,
          message: 'Status Updated to DELIVERED',
        });
    });

    it('/api/orders/:id/status  (unautorized)', () => {
      const userToken = process.env.MOCKTOKEN;

      return request(app.getHttpServer())
        .put('/api/orders/100/status')
        .send({ status: 'DELIVERED' })
        .set('Authorization', `${process.env.BEARER_KEY}${userToken}`)
        .expect(403)
        .expect(errorMessage(403, 'Forbidden', "Can't access"));
    });
  });

  describe.skip('getOrderById', () => {
    it('/api/orders/:id (success)', () => {
      const userToken = process.env.MOCKTOKEN;

      return request(app.getHttpServer())
        .get('/api/orders/1')
        .set('Authorization', ` ${process.env.BEARER_KEY}${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toEqual(true);
          expect(res.body.result).toBeInstanceOf(Object);
          expect(res.body.result).toHaveProperty('orderId');
        });
    });

    it('/api/orders/:id (Failed -not authorized)', () => {
      const userToken = process.env.MOCKOTHERUSER;

      return request(app.getHttpServer())
        .get('/api/orders/1')
        .set('Authorization', ` ${process.env.BEARER_KEY}${userToken}`)
        .expect(403)
        .expect(
          errorMessage(403, 'Forbidden', "You don't have access to this order"),
        );
    });

    it('/api/orders/:id (failed -not found With admin)', () => {
      const userToken = process.env.MOCKADMIN;

      return request(app.getHttpServer())
        .get('/api/orders/100')
        .set('Authorization', ` ${process.env.BEARER_KEY}${userToken}`)
        .expect(404)
        .expect(errorMessage(404, 'Not Found', 'Order not found'));
    });
  });

  describe('applyCoupon', () => {
    it('/api/orders/coupon (Success)', () => {
      const userToken = process.env.MOCKTOKEN;
      const applyCouponDTO: ApplyCouponDTO = {
        orderId: 1,
        discountNumber: 'qwerty',
      };

      return request(app.getHttpServer())
        .post('/api/orders/apply-coupon')
        .send(applyCouponDTO)
        .set('Authorization', ` ${process.env.BEARER_KEY}${userToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toEqual(true);
          expect(res.body.result).toBeInstanceOf(Object);
          expect(res.body.result).toHaveProperty('orderId');
        });
    });

    it.skip('/api/orders/coupon  (failed -Coupon not found)', () => {
      const userToken = process.env.MOCKTOKEN;
      const applyCouponDTO = { orderId: 1, discountNumber: 'DISCOUNT' };

      return request(app.getHttpServer())
        .post('/api/orders/apply-coupon')
        .send(applyCouponDTO)
        .set('Authorization', ` ${process.env.BEARER_KEY}${userToken}`)
        .expect(404)
        .expect(errorMessage(404, 'Not Found', 'Coupon not found'));
    });

    it.skip('/api/orders/coupon (failed - forbidden) ', () => {
      const userToken = process.env.MOCKOTHERUSER;
      const applyCouponDTO = { orderId: 1, discountNumber: 'qwerty' };

      return request(app.getHttpServer())
        .post('/api/orders/apply-coupon')
        .send(applyCouponDTO)
        .set('Authorization', ` ${process.env.BEARER_KEY}${userToken}`)
        .expect(403)
        .expect(
          errorMessage(
            403,
            'Forbidden',
            'You do not have access to this order',
          ),
        );
    });
  });
});
