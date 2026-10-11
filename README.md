# Appwrite Function: AppExpress + Mongoose + Zod User CRUD (TypeScript)

A production-ready **TypeScript** REST API built for **[Appwrite Functions](https://appwrite.io/docs/products/functions)** using **[@itznotabug/appexpress](https://github.com/itznotabug/appexpress)**, **[Mongoose](https://mongoosejs.com/)**, and **[Zod](https://zod.dev/)**.

It includes serverless connection caching for MongoDB Atlas, structured request logging, type-safe Zod validation middlewares, full User CRUD functionality, and a standalone local HTTP server for development and testing.

---

## 🚀 Features

- **TypeScript-First**: 100% strictly typed with TypeScript 5 (`NodeNext` module resolution).
- **AppExpress Routing**: Utilizes `@itznotabug/appexpress` to provide an Express-like routing and middleware developer experience tailored for Appwrite Functions.
- **Serverless Mongoose Optimization**: Connection reuse & pooling across serverless function invocations to eliminate cold-start DB latency and prevent connection exhaustion.
- **Zod Validation Middleware**: Declarative, reusable Higher-Order Function middleware (`validate({ body, params, query })`) returning clean HTTP 400 validation error responses.
- **Full User CRUD**:
  - `POST /api/users` — Create user with schema validation and unique email enforcement
  - `GET /api/users` — List users with pagination (`page`, `limit`) and filters (`search`, `role`, `isActive`)
  - `GET /api/users/:id` — Retrieve user by MongoDB ObjectId
  - `PUT /api/users/:id` & `PATCH /api/users/:id` — Update user with partial validation
  - `DELETE /api/users/:id` — Delete user by ID
  - `GET /health` — Health check endpoint showing DB connectivity and uptime
- **Dual Runtime Support**:
  - Deploy directly to **Appwrite Functions** via `src/main.ts` (`dist/main.js`).
  - Run locally as a standalone Node.js HTTP server via `npm run dev` or `npm start`.

---

## 📁 Project Architecture

```
d:/projects/appwritesample/
├── package.json               # Scripts, dependencies, and metadata
├── tsconfig.json              # TypeScript configuration (ES2022, NodeNext)
├── .env                       # Environment variables (MongoDB Atlas URI, Port)
├── .env.example               # Environment variables template
├── .gitignore
├── README.md
├── src/
│   ├── config/
│   │   └── db.ts              # Mongoose connection with serverless connection pooling
│   ├── models/
│   │   └── user.model.ts      # IUser interface and Mongoose User schema & model
│   ├── schemas/
│   │   └── user.schema.ts     # Zod validation schemas and inferred TypeScript types
│   ├── types/
│   │   └── appexpress.ts      # Appwrite & AppExpress TypeScript type definitions
│   ├── middlewares/
│   │   ├── db.middleware.ts   # Database connection middleware for AppExpress
│   │   ├── logger.middleware.ts # Incoming request logger middleware
│   │   └── validate.middleware.ts # Generic Zod validation middleware wrapper
│   ├── controllers/
│   │   └── user.controller.ts # User CRUD handlers
│   ├── routes/
│   │   └── user.routes.ts     # AppExpress.Router user routes
│   ├── app.ts                 # AppExpress app configuration & middleware pipeline
│   ├── main.ts                # Appwrite Function entry point (`app.attach(context)`)
│   └── server.ts              # Local HTTP development server
└── test/
    └── api.test.ts            # Automated E2E test suite (Health, CRUD, Validation)
```

---

## ⚙️ Configuration

The project is pre-configured with your MongoDB Atlas connection string in `.env`:

```env
# MongoDB Connection URI
MONGODB_URI=mongodb+srv://new-user01:591MPNTDNNGnkeoD@cluster0.dm3sn0b.mongodb.net/appwrite_users?retryWrites=true&w=majority

# Local Development Server Port
PORT=3000
NODE_ENV=development
```

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
Starts the local development server with live reload on `http://localhost:3000`:
```bash
npm run dev
```

### 3. Build Production Bundle
Compiles TypeScript into `dist/`:
```bash
npm run build
```

### 4. Run Automated Tests
Runs the test suite against MongoDB:
```bash
npm test
```

### 5. Type Check
Performs static type analysis without emitting files:
```bash
npm run typecheck
```

---

## 🛡️ Middlewares

### 1. Database Connection Middleware (`src/middlewares/db.middleware.ts`)
Ensures an active Mongoose connection before any route handler executes:
```typescript
import { dbMiddleware } from './middlewares/db.middleware.js';

app.middleware(dbMiddleware);
```

### 2. Request Logger Middleware (`src/middlewares/logger.middleware.ts`)
Logs incoming HTTP method, path, and timestamp using Appwrite's `context.log` or standard console:
```typescript
import { loggerMiddleware } from './middlewares/logger.middleware.js';

app.middleware(loggerMiddleware);
```

### 3. Zod Validation Middleware (`src/middlewares/validate.middleware.ts`)
Intercepts incoming requests, validates body, query, or path parameters, attaches type-safe validated properties (`request.validatedBody`, `request.validatedParams`, `request.validatedQuery`), or immediately returns a 400 Bad Request error:
```typescript
router.post(
  '/',
  validate({ body: createUserSchema })(createUser)
);

router.get(
  '/:id',
  validate({ params: userIdParamSchema })(getUserById)
);
```

---

## 📡 API Endpoints & Examples

### 1. Health Check
```bash
curl http://localhost:3000/health
```
**Response (200 OK):**
```json
{
  "status": "healthy",
  "database": "connected",
  "uptimeSeconds": 14,
  "timestamp": "2026-10-11T11:30:21.120Z"
}
```

---

### 2. Create User (POST `/api/users`)
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Connor",
    "email": "sarah.connor@example.com",
    "age": 29,
    "role": "admin"
  }'
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "name": "Sarah Connor",
    "email": "sarah.connor@example.com",
    "age": 29,
    "role": "admin",
    "isActive": true,
    "id": "6acb734d3a657b55a222a882",
    "createdAt": "2026-10-11T11:30:21.501Z",
    "updatedAt": "2026-10-11T11:30:21.501Z"
  }
}
```

---

### 3. Zod Validation Error Example
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "A",
    "email": "invalid-email",
    "age": -5
  }'
```
**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed for request body",
  "errors": [
    {
      "location": "body",
      "field": "name",
      "message": "Name must be at least 2 characters long",
      "code": "too_small"
    },
    {
      "location": "body",
      "field": "email",
      "message": "Invalid email address format",
      "code": "invalid_string"
    },
    {
      "location": "body",
      "field": "age",
      "message": "Age cannot be negative",
      "code": "too_small"
    }
  ]
}
```

---

### 4. Get All Users (GET `/api/users`)
Supports query parameters: `page`, `limit`, `search`, `role`, `isActive`.
```bash
curl "http://localhost:3000/api/users?page=1&limit=10&role=admin"
```
**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "6acb734d3a657b55a222a882",
      "name": "Sarah Connor",
      "email": "sarah.connor@example.com",
      "age": 29,
      "role": "admin",
      "isActive": true,
      "createdAt": "2026-10-11T11:30:21.501Z"
    }
  ],
  "pagination": {
    "totalUsers": 1,
    "totalPages": 1,
    "currentPage": 1,
    "limit": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### 5. Get User by ID (GET `/api/users/:id`)
```bash
curl http://localhost:3000/api/users/6acb734d3a657b55a222a882
```

---

### 6. Update User (PUT or PATCH `/api/users/:id`)
```bash
curl -X PUT http://localhost:3000/api/users/6acb734d3a657b55a222a882 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Connor Brewster",
    "age": 30
  }'
```

---

### 7. Delete User (DELETE `/api/users/:id`)
```bash
curl -X DELETE http://localhost:3000/api/users/6acb734d3a657b55a222a882
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "id": "6acb734d3a657b55a222a882",
    "name": "Sarah Connor Brewster"
  }
}
```

---

## ☁️ Deploying to Appwrite Functions

When deploying to Appwrite Functions (Console or CLI):

1. **Entrypoint**: `dist/main.js` (or `src/main.ts` if using Appwrite's TypeScript runtime).
2. **Build Command**: `npm run build`
3. **Environment Variables**: In Appwrite Console under **Function > Settings > Variables**, add:
   - `MONGODB_URI`: `mongodb+srv://new-user01:591MPNTDNNGnkeoD@cluster0.dm3sn0b.mongodb.net/appwrite_users?retryWrites=true&w=majority`
4. In Appwrite, every request to the function URL automatically attaches through `app.attach(context)`.
