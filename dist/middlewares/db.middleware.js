import { connectDB } from '../config/db.js';
/**
 * AppExpress incoming middleware: ensures MongoDB connection is active
 * before passing execution to route handlers.
 */
export const dbMiddleware = async (_request, response, _log, error) => {
    try {
        await connectDB();
    }
    catch (err) {
        const errorMsg = `[Database Middleware Error] Could not connect to MongoDB: ${err?.message || err}`;
        if (error) {
            error(errorMsg);
        }
        else {
            console.error(errorMsg);
        }
        response.json({
            success: false,
            message: 'Database connection failed',
            error: process.env.NODE_ENV === 'development' ? err?.message : undefined,
        }, 503);
    }
};
//# sourceMappingURL=db.middleware.js.map