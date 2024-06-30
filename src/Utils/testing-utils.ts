export const errorMessage = (
  statusCode: number,
  error: string,
  message: string,
): object => {
  return {
    message,
    error,
    statusCode,
  };
};
