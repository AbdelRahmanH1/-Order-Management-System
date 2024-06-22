import { ErrorInterface } from './error.interface';

export interface ResponseInterface {
  success: boolean;
  message?: string;
  token?: string;
  result?: object;
  results?: object[];
  error?: ErrorInterface;
}
