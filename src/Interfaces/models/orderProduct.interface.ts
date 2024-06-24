import { Product } from './products.interface';

export interface OrderProduct {
  orderProductId: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product?: Product;
}
