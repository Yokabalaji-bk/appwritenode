import AppExpress from '@itznotabug/appexpress';
import { dbMiddleware } from './middlewares/db.middleware.js';
import { loggerMiddleware } from './middlewares/logger.middleware.js';
import userRoutes from './routes/user.routes.js';
const app = new AppExpress();
// Global Middlewares
app.middleware(loggerMiddleware);
app.middleware(dbMiddleware);
// Base route / API metadata
app.get('/', (_request, response) => {
    response.json({
        name: 'TypeScript AppExpress + Mongoose User CRUD API',
        version: '1.0.0',
        runtime: 'TypeScript (Node.js / Appwrite Functions)',
        status: 'online',
        endpoints: {
            health: 'GET /health',
            users: {
                list: 'GET /api/users (query params: ?page=&limit=&search=&role=&isActive=)',
                create: 'POST /api/users',
                getById: 'GET /api/users/:id',
                update: 'PUT/PATCH /api/users/:id',
                delete: 'DELETE /api/users/:id',
            },
        },
        timestamp: new Date().toISOString(),
    }, 200);
});
// Health check route
app.get('/health', (_request, response) => {
    response.json({
        status: 'healthy',
        database: 'connected',
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
    }, 200);
});
// Mount user routes to /api/users and /users
app.use('/api/users', userRoutes);
app.use('/users', userRoutes);
export default app;
//# sourceMappingURL=app.js.map