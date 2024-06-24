import { Order } from 'src/Interfaces/models/order.interface';

export function formatOrderHistory(orders: Order[]): object[] {
  return orders.map((order) => ({
    orderId: order.orderId,
    orderDate: order.orderDate,
    status: order.status,
    user: {
      name: order.user.name,
      email: order.user.email,
    },
    totalPrice: order.products.reduce(
      (acc, prod) => acc + prod.quantity * prod.product.price,
      0,
    ),
    products: order.products.map((prod) => ({
      productId: prod.productId,
      productName: prod.product.name,
      quantity: prod.quantity,
      unitPrice: prod.product.price,
      subtotal: prod.quantity * prod.product.price,
    })),
  }));
}
