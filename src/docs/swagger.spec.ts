/**
 * OpenAPI 3.0 Specification for AppExpress + Mongoose User CRUD API
 */
export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'AppExpress & Mongoose User CRUD API',
    version: '1.0.0',
    description:
      'Production-ready REST API built with `@itznotabug/appexpress`, Mongoose, and Zod for Appwrite Functions & Node.js.',
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local Development Server',
    },
    {
      url: '/',
      description: 'Current Host / Appwrite Function Runtime',
    },
  ],
  tags: [
    {
      name: 'System',
      description: 'System information and health checks',
    },
    {
      name: 'Users',
      description: 'User management and CRUD operations',
    },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Check API and Database Health',
        description: 'Returns the health status of the API and its active MongoDB connection.',
        responses: {
          '200': {
            description: 'API is healthy and MongoDB is connected',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'healthy' },
                    database: { type: 'string', example: 'connected' },
                    uptimeSeconds: { type: 'integer', example: 120 },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'List All Users',
        description:
          'Retrieves a paginated list of users with optional filtering by role, activity status, or search query.',
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Page number for pagination (starts at 1)',
            required: false,
            schema: { type: 'integer', default: 1, minimum: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Number of users per page (max 100)',
            required: false,
            schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 },
          },
          {
            name: 'search',
            in: 'query',
            description: 'Search string matching user name or email (case-insensitive)',
            required: false,
            schema: { type: 'string' },
          },
          {
            name: 'role',
            in: 'query',
            description: 'Filter users by role',
            required: false,
            schema: {
              type: 'string',
              enum: ['user', 'admin', 'moderator'],
            },
          },
          {
            name: 'isActive',
            in: 'query',
            description: 'Filter users by active status',
            required: false,
            schema: { type: 'boolean' },
          },
        ],
        responses: {
          '200': {
            description: 'List of users retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserListResponse' },
              },
            },
          },
          '400': {
            description: 'Invalid query parameters',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Users'],
        summary: 'Create a New User',
        description:
          'Creates a new user record. Validated with Zod schema (requires unique email and min 2 char name).',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateUserInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserResponse' },
              },
            },
          },
          '400': {
            description: 'Validation failed for request body',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '409': {
            description: 'Email already exists',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get User by ID',
        description: 'Retrieves a single user document by their 24-character MongoDB ObjectId.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: '24-character hexadecimal MongoDB ObjectId',
            schema: { type: 'string', example: '6acb734d3a657b55a222a882' },
          },
        ],
        responses: {
          '200': {
            description: 'User found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserResponse' },
              },
            },
          },
          '400': {
            description: 'Invalid ObjectId format',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Update User by ID',
        description: 'Updates user details by ID. Validated via Zod updateUserSchema.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: '24-character hexadecimal MongoDB ObjectId',
            schema: { type: 'string', example: '6acb734d3a657b55a222a882' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateUserInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'User updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserResponse' },
              },
            },
          },
          '400': {
            description: 'Validation failed or no fields provided to update',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '409': {
            description: 'Email already taken by another user',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Partial Update User by ID',
        description: 'Partially updates user details by ID.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: '24-character hexadecimal MongoDB ObjectId',
            schema: { type: 'string', example: '6acb734d3a657b55a222a882' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateUserInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'User updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserResponse' },
              },
            },
          },
          '400': {
            description: 'Validation failed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete User by ID',
        description: 'Permanently deletes user from the database.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: '24-character hexadecimal MongoDB ObjectId',
            schema: { type: 'string', example: '6acb734d3a657b55a222a882' },
          },
        ],
        responses: {
          '200': {
            description: 'User deleted successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserResponse' },
              },
            },
          },
          '400': {
            description: 'Invalid ObjectId parameter',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '6acb734d3a657b55a222a882' },
          name: { type: 'string', example: 'Sarah Connor' },
          email: { type: 'string', format: 'email', example: 'sarah.connor@example.com' },
          age: { type: 'integer', nullable: true, example: 29 },
          role: {
            type: 'string',
            enum: ['user', 'admin', 'moderator'],
            example: 'admin',
          },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateUserInput: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
            example: 'Sarah Connor',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'sarah.connor@example.com',
          },
          age: {
            type: 'integer',
            minimum: 0,
            maximum: 150,
            nullable: true,
            example: 29,
          },
          role: {
            type: 'string',
            enum: ['user', 'admin', 'moderator'],
            default: 'user',
            example: 'admin',
          },
          isActive: {
            type: 'boolean',
            default: true,
            example: true,
          },
        },
      },
      UpdateUserInput: {
        type: 'object',
        description: 'At least one field must be supplied.',
        properties: {
          name: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
            example: 'Sarah Connor Brewster',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'sarah.brewster@example.com',
          },
          age: {
            type: 'integer',
            minimum: 0,
            maximum: 150,
            nullable: true,
            example: 30,
          },
          role: {
            type: 'string',
            enum: ['user', 'admin', 'moderator'],
            example: 'admin',
          },
          isActive: {
            type: 'boolean',
            example: true,
          },
        },
      },
      UserResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'User created successfully' },
          data: { $ref: '#/components/schemas/User' },
        },
      },
      UserListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/User' },
          },
          pagination: {
            type: 'object',
            properties: {
              totalUsers: { type: 'integer', example: 42 },
              totalPages: { type: 'integer', example: 5 },
              currentPage: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 10 },
              hasNextPage: { type: 'boolean', example: true },
              hasPrevPage: { type: 'boolean', example: false },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed for request body' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                location: { type: 'string', example: 'body' },
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'Invalid email address format' },
                code: { type: 'string', example: 'invalid_string' },
              },
            },
          },
        },
      },
    },
  },
};
