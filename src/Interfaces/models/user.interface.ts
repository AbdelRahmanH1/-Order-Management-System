import { Cart } from './cart.interface';
import { Order } from './order.interface';

export interface User {
  userId: number;
  name: string;
  email: string;
  address?: string;
  role?: string;
  cart?: Cart;
  orders?: Order[];
}
