import fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import UrlModel from "../../models/urlModel";
import UserModel from "../../models/userModel";
import { HttpStatus } from "../../utils/httpStatus";

async function routes(fastify: FastifyInstance) {
  const Url = UrlModel(fastify.pg);
  // Initialize the User model
  const User = UserModel(fastify.pg);
  fastify.get(
    "/all-expiredurl",
    {
      preHandler: verifySuperAdmin(User),
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Parse query parameters with defaults
        const { page = 1, limit = 100 } = request.query as {
          page?: string;
          limit?: string;
        };

        // Ensure they are numbers
        const currentPage = parseInt(page as string, 10) || 1;
        const currentLimit = parseInt(limit as string, 10) || 100;

        const offset = (currentPage - 1) * currentLimit;
        // Fetch paginated data
        const data = await Url.paginatedExpiredUrls(offset, currentLimit);

        // Fetch total count for metadata
        const totalCount = await Url.totalCount();
        const totalPages = Math.ceil(totalCount / currentLimit);

        // Respond with URL details
        reply.status(HttpStatus.OK).send({
          message: "success",
          data: {
            urls: data,
            meta: {
              page: currentPage,
              limit: currentLimit,
              totalPages,
              totalCount,
            },
          },
        });
      } catch (error) {
        console.error(error);
        reply.status(500).send({ error: "An unexpected error occurred." });
      }
    }
  );
}

/**
 * PreHandler Middleware: Verifies if the requester is a super_admin.
 */
function verifySuperAdmin(User: any) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();

      const user = request.user as { id: string };

      const requester = await User.findById(user.id);

      if (!requester || requester.rank !== "super_admin") {
        return reply.status(HttpStatus.FORBIDDEN).send({
          message: "Only super_admin have access to this data",
        });
      }
    } catch (err) {
      return reply.status(401).send({ message: "Unauthorized access.", err });
    }
  };
}
export default routes;
