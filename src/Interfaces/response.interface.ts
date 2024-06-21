export interface ResponseInterface {
  success: boolean;
  message?: string;
  token?: string;
  result?: object;
  results?: object[];
}
