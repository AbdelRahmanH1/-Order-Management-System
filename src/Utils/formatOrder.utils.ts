import { Order } from 'src/Interfaces/models/order.interface';

export function formatOrder(
  order: Order,
  finalPrice: number,
  discount?: number,
): object {
  return {
    orderId: order.orderId,
    orderDate: order.orderDate.toString(),
    status: order.status,
    user: {
      name: order.user.name,
      email: order.user.email,
    },
    totalPrice: finalPrice,
    discountApplied: discount,
    products: order.products.map((prod) => ({
      productId: prod.productId,
      productName: prod.product.name,
      quantity: prod.quantity,
      unitPrice: prod.product.price,
      subtotal: prod.quantity * prod.product.price,
    })),
  };
}
