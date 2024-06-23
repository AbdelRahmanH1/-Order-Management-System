export const orderDetailsResponse = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    results: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          cartId: { type: 'number' },
          userId: { type: 'number' },
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
            },
          },
          products: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'number' },
                quantity: { type: 'number' },
                product: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    price: { type: 'string' },
                    description: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
