import AppExpress from '@itznotabug/appexpress';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/user.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
  userQuerySchema,
} from '../schemas/user.schema.js';

const router = new AppExpress.Router();

/**
 * GET / - Retrieve all users (with pagination and query filters)
 */
router.get(
  '/',
  validate({ query: userQuerySchema })(getAllUsers)
);

/**
 * POST / - Create a new user (with Zod body validation)
 */
router.post(
  '/',
  validate({ body: createUserSchema })(createUser)
);

/**
 * GET /:id - Retrieve single user by ID (with Zod params validation)
 */
router.get(
  '/:id',
  validate({ params: userIdParamSchema })(getUserById)
);

/**
 * PUT /:id - Update user (with Zod params and body validation)
 */
router.put(
  '/:id',
  validate({ params: userIdParamSchema, body: updateUserSchema })(updateUser)
);

/**
 * PATCH /:id - Partial update user (with Zod params and body validation)
 */
router.patch(
  '/:id',
  validate({ params: userIdParamSchema, body: updateUserSchema })(updateUser)
);

/**
 * DELETE /:id - Delete user by ID (with Zod params validation)
 */
router.delete(
  '/:id',
  validate({ params: userIdParamSchema })(deleteUser)
);

export default router;
