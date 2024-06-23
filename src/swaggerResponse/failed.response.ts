export const failedResponse = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    error: { type: 'string' },
    statusCode: { type: 'number' },
  },
};
