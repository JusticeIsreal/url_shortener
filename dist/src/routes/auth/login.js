"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const userModel_1 = __importDefault(require("../../models/userModel"));
const httpStatus_1 = require("../../utils/httpStatus");
async function routes(fastify) {
    // Define JSON Schema for validation
    const loginSchema = {
        body: {
            type: "object",
            required: ["email", "password"],
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
            },
        },
    };
    // Initialize the User model
    const User = (0, userModel_1.default)(fastify.pg);
    /**
     * Route: POST /login
     * Purpose: Authenticate user and return a JWT token.
     */
    fastify.post("/login", {
        schema: loginSchema,
    }, async (request, reply) => {
        const { email, password } = request.body;
        try {
            // Query to fetch user by email
            const requesteredUser = await User.findByEmail(email === null || email === void 0 ? void 0 : email.toLowerCase());
            // Check if user exists
            if (!requesteredUser) {
                return reply.status(httpStatus_1.HttpStatus.UNAUTHORIZED).send({
                    error: "Invalide access",
                    message: `User does not exist with email: ${email}`,
                });
            }
            // Compare provided password with hashed password
            const passwordMatch = await bcrypt_1.default.compare(password, requesteredUser.password);
            if (!passwordMatch) {
                return reply.status(httpStatus_1.HttpStatus.UNAUTHORIZED).send({
                    error: "Invalid credentails",
                    message: "Invalid email or password.",
                });
            }
            // Generate JWT token with expiry
            const token = fastify.jwt.sign({
                id: requesteredUser.id,
                username: requesteredUser.username,
                rank: requesteredUser.rank,
            }, { expiresIn: "1h" } // Token expires in 1 hour
            );
            // Send response with sanitized user details and token
            reply.status(httpStatus_1.HttpStatus.OK).send({
                message: "Login successful.",
                token,
                user: {
                    id: requesteredUser.id,
                    username: requesteredUser.username,
                    email: requesteredUser.email,
                    rank: requesteredUser.rank,
                },
            });
        }
        catch (error) {
            // Send sanitized error response
            reply.status(httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).send({
                message: "Internal server error from login route",
                error,
            });
        }
    });
}
exports.default = routes;
