"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../../models/userModel"));
const bcrypt_1 = require("bcrypt");
const httpStatus_1 = require("../../utils/httpStatus");
/**
 * Register User Route - Allows "super_admin" to register new users.
 * Restrictions: Cannot create super_admin accounts.
 */
async function routes(fastify) {
    // JSON Schema for request validation
    const registerUserSchema = {
        body: {
            type: "object",
            required: ["email", "password", "username"],
            properties: {
                email: {
                    type: "string",
                    format: "email",
                    description: "User's email address (must be valid).",
                },
                password: {
                    type: "string",
                    minLength: 2,
                    description: "Password (minimum 2 characters).",
                },
                username: {
                    type: "string",
                    minLength: 3,
                    maxLength: 20,
                    description: "Username (3-20 characters).",
                },
                rank: {
                    type: "string",
                    description: "User rank (optional, defaults to 'admin').",
                },
            },
        },
    };
    // Initialize the User model
    const User = (0, userModel_1.default)(fastify.pg);
    /**
     * Route: POST /register-user
     * Purpose: Register a new user. Only accessible to super_admins.
     */
    fastify.post("/register-user", {
        schema: registerUserSchema,
        preHandler: verifySuperAdmin(User),
    }, async (request, reply) => {
        var _a, _b;
        const { email, password, username, rank } = request.body;
        try {
            // check if user already exists in the system
            const requesteredUser = await User.findByEmail(email === null || email === void 0 ? void 0 : email.toLowerCase());
            if (requesteredUser && requesteredUser.email === email) {
                return reply.status(httpStatus_1.HttpStatus.CONFLICT).send({
                    error: `User already exist.`,
                    message: `User with email : ${email} already exist.`,
                });
            }
            // Prevent super_admin creation
            if (rank === "super_admin") {
                return reply.status(httpStatus_1.HttpStatus.FORBIDDEN).send({
                    error: "Unauthorized.",
                    message: "Nobody can create super_admin account, contact developer.",
                });
            }
            // Hash the user's password securely
            const hashedPassword = await (0, bcrypt_1.hash)(password, 10);
            // Create the new user with rank defaulting to "admin"
            const newUser = await User.create({
                email: email === null || email === void 0 ? void 0 : email.toLowerCase(),
                username: username === null || username === void 0 ? void 0 : username.toLowerCase(),
                password: hashedPassword,
                rank: rank || "admin",
            });
            return reply.status(httpStatus_1.HttpStatus.CREATED).send({
                message: "User registered successfully",
                user: {
                    id: newUser.id,
                    email: (_a = newUser.email) === null || _a === void 0 ? void 0 : _a.toLowerCase(),
                    username: (_b = newUser.username) === null || _b === void 0 ? void 0 : _b.toLowerCase(),
                    rank: newUser.rank,
                },
            });
        }
        catch (error) {
            reply.status(httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).send({
                message: "Internal server error from registration route.",
                error,
            });
        }
    });
}
/**
 * PreHandler Middleware: Verifies if the requester is a super_admin.
 */
function verifySuperAdmin(User) {
    return async (request, reply) => {
        try {
            await request.jwtVerify();
            const user = request.user;
            const requester = await User.findById(user.id);
            if (!requester || requester.rank !== "super_admin") {
                return reply.status(httpStatus_1.HttpStatus.FORBIDDEN).send({
                    message: "Only super_admin can register new users.",
                    requester,
                });
            }
        }
        catch (err) {
            return reply.status(401).send({ message: "Unauthorized access.", err });
        }
    };
}
exports.default = routes;
