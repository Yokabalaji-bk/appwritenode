import http from 'node:http';
import dotenv from 'dotenv';
import type { AppwriteContext } from './types/appexpress.js';
import app from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

// Direct process streams to prevent infinite recursion when AppExpress overrides console.log / console.error
const writeStdout = (prefix: string, messages: unknown[]): void => {
  const formatted = messages
    .map((m) =>
      m instanceof Error ? m.stack || m.message : typeof m === 'object' ? JSON.stringify(m) : String(m)
    )
    .join(' ');
  process.stdout.write(prefix ? `${prefix} ${formatted}\n` : `${formatted}\n`);
};

const writeStderr = (prefix: string, messages: unknown[]): void => {
  const formatted = messages
    .map((m) =>
      m instanceof Error ? m.stack || m.message : typeof m === 'object' ? JSON.stringify(m) : String(m)
    )
    .join(' ');
  process.stderr.write(prefix ? `${prefix} ${formatted}\n` : `${formatted}\n`);
};

/**
 * Local HTTP Development Server
 *
 * Bridges standard Node.js HTTP requests to Appwrite Function context format,
 * allowing instant local testing via curl, Postman, or browser.
 */
const server = http.createServer(async (req, res) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const bodyBuffer = Buffer.concat(chunks);
  const bodyText = bodyBuffer.toString('utf-8');

  let bodyJson: Record<string, unknown> = {};
  if (bodyText) {
    try {
      bodyJson = JSON.parse(bodyText);
    } catch {
      bodyJson = { raw: bodyText };
    }
  }

  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || `localhost:${PORT}`}`);
  const query = Object.fromEntries(parsedUrl.searchParams.entries());

  const context: AppwriteContext = {
    req: {
      method: (req.method || 'GET').toLowerCase(),
      path: parsedUrl.pathname,
      url: req.url || '/',
      headers: (req.headers as Record<string, string>) || {},
      query,
      queryString: parsedUrl.search.replace(/^\?/, ''),
      body: bodyJson,
      bodyJson,
      bodyRaw: bodyText,
      bodyText,
      bodyBinary: bodyBuffer,
      host: req.headers.host?.split(':')[0] || 'localhost',
      port: PORT,
      scheme: 'http',
    },
    res: {
      send(body: unknown, statusCode = 200, headers = {}) {
        return { body: body as any, statusCode, headers };
      },
      json(obj: unknown, statusCode = 200, headers = {}) {
        return {
          body: JSON.stringify(obj),
          statusCode,
          headers: { 'content-type': 'application/json', ...headers },
        };
      },
      text(text: string, statusCode = 200, headers = {}) {
        return {
          body: text,
          statusCode,
          headers: { 'content-type': 'text/plain', ...headers },
        };
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
    log: (...messages: unknown[]) => writeStdout('[AppExpress Log]', messages),
    error: (...messages: unknown[]) => writeStderr('[AppExpress Error]', messages),
  };

  try {
    const result = await app.attach(context);
    const finalResp = result || context.res.dynamic;

    const statusCode = finalResp?.statusCode || 200;
    const headers = finalResp?.headers || { 'content-type': 'application/json' };
    const body = finalResp?.body !== undefined ? finalResp.body : '';

    res.writeHead(statusCode, headers);
    if (Buffer.isBuffer(body)) {
      res.end(body);
    } else if (typeof body === 'object') {
      res.end(JSON.stringify(body));
    } else {
      res.end(String(body));
    }
  } catch (err: any) {
    writeStderr('[Server Error]', [err]);
    res.writeHead(500, { 'content-type': 'application/json' });
    res.end(
      JSON.stringify({
        success: false,
        message: 'Internal Server Error',
        error: err?.message,
      })
    );
  }
});

// Handle server-level errors gracefully
server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    writeStderr(`[Server Error] Port ${PORT} is already in use by another process.`, [
      `Please terminate the process on port ${PORT} or change PORT in .env`,
    ]);
  } else {
    writeStderr('[Server Error]', [err]);
  }
  process.exit(1);
});

// Start listening after verifying MongoDB Atlas connectivity
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      writeStdout('', [
        `=================================================`,
        `🚀 TypeScript AppExpress Server: http://localhost:${PORT}`,
        `📖 Swagger UI Docs:  http://localhost:${PORT}/docs`,
        `📄 OpenAPI Spec JSON: http://localhost:${PORT}/docs/json`,
        `📊 Health Check:      http://localhost:${PORT}/health`,
        `👥 Users API:         http://localhost:${PORT}/api/users`,
        `=================================================`,
      ]);
    });
  })
  .catch((err: any) => {
    writeStderr('Failed to start server due to database error:', [err?.message || err]);
    process.exit(1);
  });
