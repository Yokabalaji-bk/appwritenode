import type {
  AppExpressRequest,
  AppExpressResponse,
} from '../types/appexpress.js';
import { connectDB } from '../config/db.js';

/**
 * AppExpress incoming middleware: ensures MongoDB connection is active
 * before passing execution to route handlers.
 */
export const dbMiddleware = async (
  _request: AppExpressRequest,
  response: AppExpressResponse,
  _log?: (...args: unknown[]) => void,
  error?: (...args: unknown[]) => void
): Promise<void> => {
  try {
    await connectDB();
  } catch (err: any) {
    const errorMsg = `[Database Middleware Error] Could not connect to MongoDB: ${err?.message || err}`;
    if (error) {
      error(errorMsg);
    } else {
      console.error(errorMsg);
    }

    response.json(
      {
        success: false,
        message: 'Database connection failed',
        error: process.env.NODE_ENV === 'development' ? err?.message : undefined,
      },
      503
    );
  }
};
