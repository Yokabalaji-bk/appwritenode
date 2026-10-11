import { swaggerSpec } from './swagger.spec.js';

/**
 * Returns self-contained interactive Swagger UI HTML
 */
export const getSwaggerHtml = (specUrl: string = '/docs/json'): string => {
  const specJson = JSON.stringify(swaggerSpec);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AppExpress API Documentation</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.18.2/swagger-ui.css">
  <link rel="icon" type="image/png" href="https://appwrite.io/images/favicon.png">
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin: 0;
      background: #fafafa;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .topbar-custom {
      background: #191924;
      padding: 14px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .topbar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #fff;
      font-weight: 700;
      font-size: 18px;
      text-decoration: none;
    }
    .topbar-badge {
      background: #fd366e;
      color: #fff;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .topbar-links a {
      color: #d1d5db;
      text-decoration: none;
      font-size: 14px;
      margin-left: 18px;
      transition: color 0.2s;
    }
    .topbar-links a:hover {
      color: #fff;
    }
    .swagger-ui .info {
      margin: 25px 0;
    }
    .swagger-ui .topbar {
      display: none;
    }
  </style>
</head>
<body>
  <div class="topbar-custom">
    <a href="/docs" class="topbar-brand">
      <span>🚀 AppExpress + Mongoose CRUD API</span>
      <span class="topbar-badge">OpenAPI 3.0</span>
    </a>
    <div class="topbar-links">
      <a href="/docs/json" target="_blank">📄 Raw Spec (JSON)</a>
      <a href="/health" target="_blank">💚 Health Check</a>
    </div>
  </div>

  <div id="swagger-ui"></div>

  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.18.2/swagger-ui-bundle.js" charset="UTF-8"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.18.2/swagger-ui-standalone-preset.js" charset="UTF-8"></script>
  <script>
    window.onload = function() {
      // Use inlined spec as primary for instant load, fallback to URL
      const spec = ${specJson};

      window.ui = SwaggerUIBundle({
        spec: spec,
        url: "${specUrl}",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "BaseLayout",
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        docExpansion: "list",
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        tryItOutEnabled: true
      });
    };
  </script>
</body>
</html>`;
};
