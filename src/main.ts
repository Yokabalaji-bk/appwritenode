import type { AppwriteContext } from './types/appexpress.js';
import app from './app.js';

/**
 * Appwrite Function Entry Point
 *
 * In Appwrite serverless functions, Appwrite executes this default export
 * and supplies the context object: { req, res, log, error }.
 *
 * AppExpress attaches seamlessly to this context to provide route handling,
 * middleware execution, and response serialization.
 *
 * @param context Appwrite runtime context
 * @returns {Promise<any>}
 */
export default async (context: AppwriteContext): Promise<any> => {
  return await app.attach(context);
};
