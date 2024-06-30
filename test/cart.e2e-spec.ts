import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AddCartDTO } from 'src/modules/Cart/cartDTO/addCart.dto';
import { RemoveCartDTO } from 'src/modules/Cart/cartDTO/removeCart.dto';
import * as request from 'supertest';
import { errorMessage } from '../src/Utils/testing-utils';
import { CartModule } from '../src/modules/Cart/cart.module';
import { CartService } from '../src/modules/Cart/cart.service';
describe('AppController (e2e)', () => {
  let app: INestApplication;
  const mockCartService = {
    addToCart: jest.fn().mockResolvedValue({
      success: true,
      message: 'Product added successfully to Cart',
    }),
    updateCart: jest.fn().mockResolvedValue({
      success: true,
      message: 'Product quantity updated successfully.',
    }),
    removeFromCart: jest.fn().mockResolvedValue({
      success: true,
      message: 'Product removed successfully',
    }),
    viewCart: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CartModule],
      providers: [{ provide: CartService, useValue: mockCartService }],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe.skip('addToCart', () => {
    it('/api/cart/add (success)', async () => {
      const addCartDTO = {
        productId: 100,
        quantity: 1,
      };

      const userToken = process.env.MOCKTOKEN;

      return request(app.getHttpServer())
        .post('/api/cart/add')
        .send(addCartDTO)
        .set('Authorization', `${process.env.BEARER_KEY}${userToken}`)
        .expect(201)
        .expect({
          success: true,
          message: 'Product added successfully to Cart',
        });
    });
    it('/api/cart/add (Product not found)', async () => {
      const addCartDTO: AddCartDTO = {
        productId: 1,
        quantity: 2,
      };

      const userToken = process.env.MOCKTOKEN;

      return request(app.getHttpServer())
        .post('/api/cart/add')
        .send(addCartDTO)
        .set('Authorization', `${process.env.BEARER_KEY}${userToken}`)
        .expect(404)
        .expect(errorMessage(404, 'Not Found', 'Product not found'));
    });
    it('/api/cart/add (Stock Not Enough)', async () => {
      const addCartDTO: AddCartDTO = {
        productId: 100,
        quantity: 10,
      };

      const userToken = process.env.MOCKTOKEN;

      return request(app.getHttpServer())
        .post('/api/cart/add')
        .send(addCartDTO)
        .set('Authorization', `${process.env.BEARER_KEY}${userToken}`)
        .expect(400)
        .expect(errorMessage(400, 'Bad Request', 'Insufficient product stock'));
    });
  });

  describe.skip('updateCart', () => {
    it('/api/cart/update (success)', async () => {
      const updateCartDTO: AddCartDTO = {
        productId: 100,
        quantity: 1,
      };

      const userToken = process.env.MOCKTOKEN;

      return request(app.getHttpServer())
        .put('/api/cart/update')
        .send(updateCartDTO)
        .set('Authorization', `${process.env.BEARER_KEY}${userToken}`)
        .expect(200)
        .expect({
          success: true,
          message: 'Product quantity updated successfully.',
        });
    });

    it('/api/cart/update (Product not found)', async () => {
      const updateCartDTO: AddCartDTO = {
        productId: 101,
        quantity: 3,
      };

      const userToken = process.env.MOCKTOKEN;

      return request(app.getHttpServer())
        .put('/api/cart/update')
        .send(updateCartDTO)
        .set('Authorization', `${process.env.BEARER_KEY}${userToken}`)
        .expect(400)
        .expect(errorMessage(400, 'Bad Request', 'Product is not in the cart'));
    });
  });

  describe.skip('removeFromCart', () => {
    it('/api/cart/remove (success)', async () => {
      const removeCartDTO: RemoveCartDTO = {
        productId: 100,
      };

      const userToken = process.env.MOCKTOKEN;

      return request(app.getHttpServer())
        .delete('/api/cart/remove')
        .send(removeCartDTO)
        .set('Authorization', `${process.env.BEARER_KEY}${userToken}`)
        .expect(200)
        .expect({
          success: true,
          message: 'Product removed successfully',
        });
    });
    it('/api/cart/remove (Product not found in cart)', async () => {
      const removeCartDTO: RemoveCartDTO = {
        productId: 1,
      };

      const userToken = process.env.MOCKTOKEN;

      return request(app.getHttpServer())
        .delete('/api/cart/remove')
        .send(removeCartDTO)
        .set('Authorization', `${process.env.BEARER_KEY}${userToken}`)
        .expect(404)
        .expect(errorMessage(404, 'Not Found', 'Product not found in cart'));
    });
  });

  describe.skip('viewCart', () => {
    it('/api/cart (success User Access)', async () => {
      const userId = 1;
      const userToken = process.env.MOCKTOKEN;

      return request(app.getHttpServer())
        .get(`/api/cart/${userId}`)
        .set('Authorization', `${process.env.BEARER_KEY}${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('result');
        });
    });
    it('/api/cart (Success Admin Access)', async () => {
      const userId = 1;
      const userToken = process.env.MOCKADMIN;

      return request(app.getHttpServer())
        .get(`/api/cart/${userId}`)
        .set('Authorization', `${process.env.BEARER_KEY}${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('result');
        });
    });
    it('/api/cart (failed unauthorized User)', async () => {
      const userId = 1;
      const userToken = process.env.MOCKOTHERUSER;

      return request(app.getHttpServer())
        .get(`/api/cart/${userId}`)
        .set('Authorization', `${process.env.BEARER_KEY}${userToken}`)
        .expect(403)
        .expect(errorMessage(403, 'Forbidden', 'Unauthorized access to cart'));
    });
  });
});
