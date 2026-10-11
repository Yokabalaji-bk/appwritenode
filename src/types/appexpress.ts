/**
 * AppExpress & Appwrite runtime type definitions
 */

export interface AppwriteRequest {
  readonly body: string | Record<string, unknown>;
  readonly bodyRaw: string;
  readonly bodyText: string;
  readonly bodyJson: Record<string, unknown>;
  readonly bodyBinary: Buffer;
  readonly headers: Record<string, string>;
  readonly method: string;
  readonly host: string;
  readonly scheme: string;
  readonly query: Record<string, string>;
  readonly queryString: string;
  readonly port: number;
  readonly url: string;
  readonly path: string;
  params?: Record<string, string>;
}

export interface AppwriteResponseObject {
  body: Buffer | string | Record<string, unknown> | Promise<Buffer | string | Record<string, unknown>>;
  statusCode: number;
  headers: Record<string, string | number | boolean>;
}

export interface AppwriteResponse {
  send(body: unknown, statusCode?: number, headers?: Record<string, string | number | boolean>): AppwriteResponseObject;
  text(body: string, statusCode?: number, headers?: Record<string, string | number | boolean>): AppwriteResponseObject;
  binary(bytes: Buffer | Promise<string | Buffer>, statusCode?: number, headers?: Record<string, string | number | boolean>): AppwriteResponseObject;
  json(obj: unknown, statusCode?: number, headers?: Record<string, string | number | boolean>): AppwriteResponseObject;
  empty(): AppwriteResponseObject;
  redirect(url: string, statusCode?: number, headers?: Record<string, string | number | boolean>): AppwriteResponseObject;
  dynamic?: AppwriteResponseObject;
}

export interface AppwriteContext {
  req: AppwriteRequest;
  res: AppwriteResponse;
  log: (...messages: unknown[]) => void;
  error: (...messages: unknown[]) => void;
}

export interface AppExpressRequest {
  readonly bodyRaw?: string;
  readonly bodyText?: string;
  readonly body: Record<string, unknown>;
  readonly bodyJson: Record<string, unknown>;
  readonly bodyBinary: Buffer;
  readonly headers: Record<string, string>;
  readonly scheme: string;
  readonly method: string;
  readonly url: string;
  readonly host: string;
  readonly port: number;
  readonly path: string;
  readonly queryString: string;
  readonly params: Record<string, string>;
  readonly query: Record<string, string>;
  readonly triggeredType?: 'event' | 'http' | 'schedule';
}

export interface AppExpressResponse {
  setHeaders(headers: Record<string, string | number | boolean>): void;
  clearHeaders(): void;
  empty(): void;
  json(data: unknown, statusCode?: number): void;
  redirect(url: string): void;
  text(content: unknown, statusCode?: number, contentType?: string): void;
  send(content: unknown, statusCode?: number, contentType?: string): void;
  binary(contentOrPath: Buffer | string, statusCode?: number, contentType?: string): void;
  render(filePath: string, options?: Record<string, unknown>, statusCode?: number): void;
}

export type AppExpressRequestHandler = (
  request: AppExpressRequest,
  response: AppExpressResponse,
  log?: (...messages: unknown[]) => void,
  error?: (...messages: unknown[]) => void
) => unknown | Promise<unknown>;
