import { CartProduct } from './cartProduct.interface';
import { User } from './user.interface';

export interface Cart {
  cartId: number;
  userId: number;
  user?: User;
  products: CartProduct[];
}
