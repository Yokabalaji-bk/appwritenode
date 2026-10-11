import type { AppwriteContext } from '../src/types/appexpress.js';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/user.model.js';

interface TestResponse {
  statusCode: number;
  body: any;
}

const origLog = process.stdout.write.bind(process.stdout);
const origErr = process.stderr.write.bind(process.stderr);

async function makeRequest({
  method,
  path,
  body = null,
  query = {},
}: {
  method: string;
  path: string;
  body?: any;
  query?: Record<string, string>;
}): Promise<TestResponse> {
  const queryStr = new URLSearchParams(query).toString();
  const fullPath = queryStr ? `${path}?${queryStr}` : path;
  const bodyText = body ? JSON.stringify(body) : '';
  const bodyJson = body || {};

  const context: AppwriteContext = {
    req: {
      method: method.toLowerCase(),
      path,
      url: fullPath,
      headers: { 'content-type': 'application/json' },
      query,
      queryString: queryStr,
      body: bodyJson,
      bodyJson,
      bodyRaw: bodyText,
      bodyText,
      bodyBinary: Buffer.from(bodyText),
      host: 'localhost',
      port: 3000,
      scheme: 'http',
    },
    res: {
      send(b: unknown, statusCode = 200, headers = {}) {
        return { body: b as any, statusCode, headers };
      },
      json(obj: unknown, statusCode = 200, headers = {}) {
        return {
          body: obj as any,
          statusCode,
          headers: { 'content-type': 'application/json', ...headers },
        };
      },
      text(t: string, statusCode = 200, headers = {}) {
        return { body: t, statusCode, headers };
      },
      binary(bytes: Buffer | Promise<string | Buffer>, statusCode = 200, headers = {}) {
        return { body: bytes, statusCode, headers };
      },
      empty() {
        return { body: '', statusCode: 204, headers: {} };
      },
      redirect(url: string, statusCode = 302, headers = {}) {
        return { body: '', statusCode, headers: { location: url, ...headers } };
      },
    },
    log: (...args: unknown[]) => origLog(args.map(String).join(' ') + '\n'),
    error: (...args: unknown[]) => origErr(args.map(String).join(' ') + '\n'),
  };

  const result = await app.attach(context);
  const finalResp = result || context.res.dynamic;
  let parsedBody = finalResp?.body;
  if (typeof parsedBody === 'string') {
    try {
      parsedBody = JSON.parse(parsedBody);
    } catch {
      // plain text string
    }
  }

  return {
    statusCode: finalResp?.statusCode || 200,
    body: parsedBody,
  };
}

async function runTests() {
  origLog('\n🧪 Starting TypeScript AppExpress + Mongoose + Zod API Tests...\n\n');

  try {
    await connectDB();
    origLog('✅ Connected to MongoDB Atlas\n\n');

    // 1. Health check test
    origLog('Test 1: Health check endpoint (GET /health)\n');
    const healthRes = await makeRequest({ method: 'GET', path: '/health' });
    origLog(`Status: ${healthRes.statusCode}, Database: ${healthRes.body?.database}\n`);
    if (healthRes.statusCode !== 200) throw new Error('Health check failed');
    origLog(' Passed\n\n');

    // 2. Validation error test: Missing / invalid fields
    origLog('Test 2: Zod validation on POST /api/users with invalid body\n');
    const invalidRes = await makeRequest({
      method: 'POST',
      path: '/api/users',
      body: { name: 'A', email: 'not-an-email', age: -5 },
    });
    origLog(`Status: ${invalidRes.statusCode}, Success: ${invalidRes.body?.success}\n`);
    origLog(
      `Validation errors captured: ${JSON.stringify(invalidRes.body?.errors?.map((e: any) => e.field))}\n`
    );
    if (invalidRes.statusCode !== 400 || !invalidRes.body?.errors?.length) {
      throw new Error('Zod validation should have rejected invalid payload');
    }
    origLog(' Passed\n\n');

    // Clean up previous test users
    const testEmail = `ts.user.${Date.now()}@example.com`;
    await User.deleteMany({ email: { $regex: /ts\.user\..*@example\.com/ } });

    // 3. Create user with valid payload
    origLog('Test 3: Create User (POST /api/users)\n');
    const createRes = await makeRequest({
      method: 'POST',
      path: '/api/users',
      body: {
        name: 'Alex Johnson',
        email: testEmail,
        age: 28,
        role: 'admin',
      },
    });
    origLog(
      `Status: ${createRes.statusCode}, Created User ID: ${createRes.body?.data?.id}\n`
    );
    if (createRes.statusCode !== 201 || !createRes.body?.data?.id) {
      throw new Error(`User creation failed: ${JSON.stringify(createRes.body)}`);
    }
    const createdUserId = createRes.body.data.id;
    origLog(' Passed\n\n');

    // 4. Duplicate email validation
    origLog('Test 4: Duplicate email check (POST /api/users)\n');
    const duplicateRes = await makeRequest({
      method: 'POST',
      path: '/api/users',
      body: {
        name: 'Duplicate Alex',
        email: testEmail,
      },
    });
    origLog(
      `Status: ${duplicateRes.statusCode}, Message: ${duplicateRes.body?.message}\n`
    );
    if (duplicateRes.statusCode !== 409) {
      throw new Error('Expected 409 Conflict for duplicate email');
    }
    origLog(' Passed\n\n');

    // 5. Get all users
    origLog('Test 5: Get All Users (GET /api/users)\n');
    const listRes = await makeRequest({
      method: 'GET',
      path: '/api/users',
      query: { page: '1', limit: '5' },
    });
    origLog(
      `Status: ${listRes.statusCode}, Total Users: ${listRes.body?.pagination?.totalUsers}\n`
    );
    if (listRes.statusCode !== 200 || !Array.isArray(listRes.body?.data)) {
      throw new Error('Listing users failed');
    }
    origLog(' Passed\n\n');

    // 6. Get user by ID
    origLog(`Test 6: Get User by ID (GET /api/users/${createdUserId})\n`);
    const getByIdRes = await makeRequest({
      method: 'GET',
      path: `/api/users/${createdUserId}`,
    });
    origLog(
      `Status: ${getByIdRes.statusCode}, Retrieved Name: ${getByIdRes.body?.data?.name}\n`
    );
    if (getByIdRes.statusCode !== 200 || getByIdRes.body?.data?.id !== createdUserId) {
      throw new Error('Get by ID failed');
    }
    origLog(' Passed\n\n');

    // 7. Update user
    origLog(`Test 7: Update User (PUT /api/users/${createdUserId})\n`);
    const updateRes = await makeRequest({
      method: 'PUT',
      path: `/api/users/${createdUserId}`,
      body: {
        name: 'Alex Johnson Updated',
        age: 29,
      },
    });
    origLog(
      `Status: ${updateRes.statusCode}, Updated Name: ${updateRes.body?.data?.name}, Age: ${updateRes.body?.data?.age}\n`
    );
    if (
      updateRes.statusCode !== 200 ||
      updateRes.body?.data?.name !== 'Alex Johnson Updated'
    ) {
      throw new Error('Update user failed');
    }
    origLog(' Passed\n\n');

    // 8. Delete user
    origLog(`Test 8: Delete User (DELETE /api/users/${createdUserId})\n`);
    const deleteRes = await makeRequest({
      method: 'DELETE',
      path: `/api/users/${createdUserId}`,
    });
    origLog(`Status: ${deleteRes.statusCode}, Message: ${deleteRes.body?.message}\n`);
    if (deleteRes.statusCode !== 200) {
      throw new Error('Delete user failed');
    }
    origLog(' Passed\n\n');

    // 9. Verify user is deleted
    origLog(`Test 9: Verify 404 for deleted user (GET /api/users/${createdUserId})\n`);
    const verify404 = await makeRequest({
      method: 'GET',
      path: `/api/users/${createdUserId}`,
    });
    origLog(`Status: ${verify404.statusCode}, Message: ${verify404.body?.message}\n`);
    if (verify404.statusCode !== 404) {
      throw new Error('Expected 404 for deleted user');
    }
    origLog(' Passed\n\n');

    origLog('🎉 ALL 9 TESTS PASSED SUCCESSFULLY! TypeScript CRUD API is working perfectly.\n\n');
  } catch (err: any) {
    origErr(`❌ Test failed with error: ${err?.message || err}\n`);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

runTests();
