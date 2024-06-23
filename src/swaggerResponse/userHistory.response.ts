export const userHistoryResponse = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    results: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          orderId: { type: 'number' },
          orderDate: { type: 'string' },
          status: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
            },
          },
          totalPrice: { type: 'number' },
          products: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'number' },
                productName: { type: 'string' },
                quantity: { type: 'number' },
                unitPrice: { type: 'number' },
                subtotal: { type: 'number' },
              },
            },
          },
        },
      },
    },
  },
};
