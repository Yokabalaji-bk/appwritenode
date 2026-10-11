/**
 * AppExpress incoming request logging middleware
 */
export const loggerMiddleware = (request, _response, log, _error) => {
    const timestamp = new Date().toISOString();
    const method = request.method?.toUpperCase();
    const path = request.path;
    const logMessage = `[${timestamp}] ${method} ${path}`;
    if (log) {
        log(logMessage);
    }
    else {
        console.log(logMessage);
    }
};
//# sourceMappingURL=logger.middleware.js.map