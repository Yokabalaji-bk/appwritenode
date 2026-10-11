import type {
  AppExpressRequest,
  AppExpressResponse,
} from '../types/appexpress.js';

/**
 * AppExpress incoming request logging middleware
 */
export const loggerMiddleware = (
  request: AppExpressRequest,
  _response: AppExpressResponse,
  log?: (...args: unknown[]) => void,
  _error?: (...args: unknown[]) => void
): void => {
  const timestamp = new Date().toISOString();
  const method = request.method?.toUpperCase();
  const path = request.path;

  const logMessage = `[${timestamp}] ${method} ${path}`;

  if (log) {
    log(logMessage);
  } else {
    console.log(logMessage);
  }
};
