import { User } from '../models/user.model.js';
/**
 * Controller: Create a new user
 * POST /api/users
 */
export const createUser = async (request, response, _log, error) => {
    try {
        const payload = request.validatedBody || request.body;
        // Check unique email
        const existingUser = await User.findOne({ email: payload.email });
        if (existingUser) {
            response.json({
                success: false,
                message: 'User with this email already exists',
            }, 409);
            return;
        }
        const newUser = await User.create(payload);
        response.json({
            success: true,
            message: 'User created successfully',
            data: newUser,
        }, 201);
    }
    catch (err) {
        if (error)
            error('Error in createUser:', err);
        response.json({
            success: false,
            message: 'Failed to create user',
            error: err?.message,
        }, 500);
    }
};
/**
 * Controller: Get all users with pagination and search filter
 * GET /api/users
 */
export const getAllUsers = async (request, response, _log, error) => {
    try {
        const query = request.validatedQuery || request.query || {};
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const filter = {};
        if (query.role) {
            filter.role = query.role;
        }
        if (typeof query.isActive === 'boolean') {
            filter.isActive = query.isActive;
        }
        if (query.search) {
            const searchRegex = new RegExp(query.search, 'i');
            filter.$or = [{ name: searchRegex }, { email: searchRegex }];
        }
        const [totalUsers, users] = await Promise.all([
            User.countDocuments(filter),
            User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        ]);
        const totalPages = Math.ceil(totalUsers / limit);
        response.json({
            success: true,
            data: users,
            pagination: {
                totalUsers,
                totalPages,
                currentPage: page,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        }, 200);
    }
    catch (err) {
        if (error)
            error('Error in getAllUsers:', err);
        response.json({
            success: false,
            message: 'Failed to fetch users',
            error: err?.message,
        }, 500);
    }
};
/**
 * Controller: Get single user by ID
 * GET /api/users/:id
 */
export const getUserById = async (request, response, _log, error) => {
    try {
        const userId = request.validatedParams?.id || request.params?.id;
        const user = await User.findById(userId);
        if (!user) {
            response.json({
                success: false,
                message: `User with ID '${userId}' not found`,
            }, 404);
            return;
        }
        response.json({
            success: true,
            data: user,
        }, 200);
    }
    catch (err) {
        if (error)
            error('Error in getUserById:', err);
        response.json({
            success: false,
            message: 'Failed to fetch user',
            error: err?.message,
        }, 500);
    }
};
/**
 * Controller: Update user by ID
 * PUT/PATCH /api/users/:id
 */
export const updateUser = async (request, response, _log, error) => {
    try {
        const userId = request.validatedParams?.id || request.params?.id;
        const updateData = request.validatedBody || request.body;
        // If updating email, check for conflicts
        if (updateData.email) {
            const conflictUser = await User.findOne({
                email: updateData.email,
                _id: { $ne: userId },
            });
            if (conflictUser) {
                response.json({
                    success: false,
                    message: 'Email address is already in use by another account',
                }, 409);
                return;
            }
        }
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true,
        });
        if (!updatedUser) {
            response.json({
                success: false,
                message: `User with ID '${userId}' not found`,
            }, 404);
            return;
        }
        response.json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser,
        }, 200);
    }
    catch (err) {
        if (error)
            error('Error in updateUser:', err);
        response.json({
            success: false,
            message: 'Failed to update user',
            error: err?.message,
        }, 500);
    }
};
/**
 * Controller: Delete user by ID
 * DELETE /api/users/:id
 */
export const deleteUser = async (request, response, _log, error) => {
    try {
        const userId = request.validatedParams?.id || request.params?.id;
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            response.json({
                success: false,
                message: `User with ID '${userId}' not found`,
            }, 404);
            return;
        }
        response.json({
            success: true,
            message: 'User deleted successfully',
            data: deletedUser,
        }, 200);
    }
    catch (err) {
        if (error)
            error('Error in deleteUser:', err);
        response.json({
            success: false,
            message: 'Failed to delete user',
            error: err?.message,
        }, 500);
    }
};
//# sourceMappingURL=user.controller.js.map