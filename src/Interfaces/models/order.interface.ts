import { Coupon } from './coupon.interface';
import { OrderProduct } from './orderProduct.interface';
import { User } from './user.interface';

export interface Order {
  orderId: number;
  orderDate: Date;
  status: string;
  userId: number;
  user: User;
  products: OrderProduct[];
  coupon?: Coupon;
  finalPrice?: number;
}
