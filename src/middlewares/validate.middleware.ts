import { ZodType, ZodTypeDef } from 'zod';
import type {
  AppExpressRequest,
  AppExpressResponse,
  AppExpressRequestHandler,
} from '../types/appexpress.js';

export interface ValidatedRequest<TBody = any, TParams = any, TQuery = any>
  extends AppExpressRequest {
  validatedBody?: TBody;
  validatedParams?: TParams;
  validatedQuery?: TQuery;
}

export interface ValidationSchemas<TBody = any, TParams = any, TQuery = any> {
  body?: ZodType<TBody, ZodTypeDef, any>;
  params?: ZodType<TParams, ZodTypeDef, any>;
  query?: ZodType<TQuery, ZodTypeDef, any>;
}

/**
 * Higher-Order Function wrapping AppExpress route handlers with type-safe Zod validation.
 */
export const validate = <TBody = any, TParams = any, TQuery = any>(
  schemas: ValidationSchemas<TBody, TParams, TQuery>
) => {
  return (
    handler: (
      request: ValidatedRequest<TBody, TParams, TQuery>,
      response: AppExpressResponse,
      log?: (...args: unknown[]) => void,
      error?: (...args: unknown[]) => void
    ) => unknown | Promise<unknown>
  ): AppExpressRequestHandler => {
    return async (
      request: AppExpressRequest,
      response: AppExpressResponse,
      log?: (...args: unknown[]) => void,
      error?: (...args: unknown[]) => void
    ) => {
      // 1. Validate route params (:id, etc.)
      if (schemas.params) {
        const paramResult = schemas.params.safeParse(request.params || {});
        if (!paramResult.success) {
          const errors = paramResult.error.issues.map((issue) => ({
            location: 'params',
            field: issue.path.join('.') || 'param',
            message: issue.message,
            code: issue.code,
          }));

          response.json(
            {
              success: false,
              message: 'Invalid route parameters',
              errors,
            },
            400
          );
          return;
        }
        (request as ValidatedRequest<TBody, TParams, TQuery>).validatedParams =
          paramResult.data;
      }

      // 2. Validate query parameters (?page=1&limit=10)
      if (schemas.query) {
        const queryResult = schemas.query.safeParse(request.query || {});
        if (!queryResult.success) {
          const errors = queryResult.error.issues.map((issue) => ({
            location: 'query',
            field: issue.path.join('.') || 'query',
            message: issue.message,
            code: issue.code,
          }));

          response.json(
            {
              success: false,
              message: 'Invalid query parameters',
              errors,
            },
            400
          );
          return;
        }
        (request as ValidatedRequest<TBody, TParams, TQuery>).validatedQuery =
          queryResult.data;
      }

      // 3. Validate request body
      if (schemas.body) {
        const bodyData = request.body || {};
        const bodyResult = schemas.body.safeParse(bodyData);
        if (!bodyResult.success) {
          const errors = bodyResult.error.issues.map((issue) => ({
            location: 'body',
            field: issue.path.join('.') || 'body',
            message: issue.message,
            code: issue.code,
          }));

          response.json(
            {
              success: false,
              message: 'Validation failed for request body',
              errors,
            },
            400
          );
          return;
        }
        (request as ValidatedRequest<TBody, TParams, TQuery>).validatedBody =
          bodyResult.data;
      }

      // Call route handler if all validations succeed
      return await handler(
        request as ValidatedRequest<TBody, TParams, TQuery>,
        response,
        log,
        error
      );
    };
  };
};
