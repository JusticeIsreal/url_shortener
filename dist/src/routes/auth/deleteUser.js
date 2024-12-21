"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../../models/userModel"));
const httpStatus_1 = require("../../utils/httpStatus");
/**
 * DELETE USER ROUTE
 * Allows only super_admin to delete users.
 */
async function routes(fastify) {
    // Define JSON schema for request body validation
    const deleteUserSchema = {
        body: {
            type: "object",
            required: ["email"],
            properties: {
                email: { type: "string", format: "email" }, // Validate email format
            },
        },
    };
    // Initialize the User model with database instance
    const User = (0, userModel_1.default)(fastify.pg);
    fastify.delete("/delete-user", {
        schema: deleteUserSchema,
        preHandler: validateDeleter(User), // Apply pre-handler middleware
    }, async (request, reply) => {
        const { email } = request.body;
        try {
            // Check if the user to be deleted exists
            const userToDelete = await User.findByEmail(email);
            if (!userToDelete) {
                return reply.status(httpStatus_1.HttpStatus.NOT_FOUND).send({
                    error: "User not found.",
                    message: `No user with the email: ${email} is found in the system`,
                });
            }
            // Prevent deletion of super_admin accounts
            if (userToDelete.rank === "super_admin") {
                return reply
                    .status(httpStatus_1.HttpStatus.FORBIDDEN)
                    .send({ message: "Cannot delete super_admin accounts." });
            }
            // Perform the deletion
            await User.deleteByEmail(email);
            // Respond with success
            reply.status(httpStatus_1.HttpStatus.OK).send({
                message: "User deleted successfully",
                user: {
                    email: userToDelete.email,
                    rank: userToDelete.rank,
                },
            });
        }
        catch (error) {
            console.error("Error deleting user:", error);
            reply
                .status(httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR)
                .send({ message: "Internal server error from delete user route" });
        }
    });
}
/**
 * Pre-handler middleware to validate if the requester can delete users.
 * Only users with the rank of super_admin are authorized.
 */
function validateDeleter(User) {
    return async (request, reply) => {
        try {
            // Authenticate the user using JWT
            await request.jwtVerify();
            // Retrieve user details from the JWT token
            const user = request.user;
            // Fetch the requester details from the database
            const requester = await User.findById(user.id);
            // Authorization check: Only super_admin can delete users
            if (!requester || requester.rank !== "super_admin") {
                return reply.status(httpStatus_1.HttpStatus.FORBIDDEN).send({
                    error: "Unauthorized",
                    message: "Only super_admin can delete a user.",
                });
            }
        }
        catch (err) {
            return reply
                .status(httpStatus_1.HttpStatus.UNAUTHORIZED)
                .send({ message: "Unauthorized", err });
        }
    };
}
exports.default = routes;
