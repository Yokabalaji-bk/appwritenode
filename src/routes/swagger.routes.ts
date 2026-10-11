import AppExpress from '@itznotabug/appexpress';
import type {
  AppExpressRequest,
  AppExpressResponse,
} from '../types/appexpress.js';
import { swaggerSpec } from '../docs/swagger.spec.js';
import { getSwaggerHtml } from '../docs/swagger.ui.js';

const router = new AppExpress.Router();

// Serves the OpenAPI 3.0 specification in JSON format
const serveSpecJson = (_req: AppExpressRequest, res: AppExpressResponse) => {
  res.json(swaggerSpec, 200);
};

// Serves the interactive Swagger UI page in HTML format
const serveSwaggerUI = (_req: AppExpressRequest, res: AppExpressResponse) => {
  const html = getSwaggerHtml('/docs/json');
  res.text(html, 200, 'text/html');
};

router.get('/json', serveSpecJson);
router.get('/', serveSwaggerUI);

export default router;
