import { FastifyInstance } from "fastify";

export default async (fastify: FastifyInstance) => {
  fastify.route({
    method: "GET",
    url: "/",
    handler: async (request, reply) => {
      try {
        const response = await fastify.prisma.proxy.findMany({});
        reply.send({
          success: true,
          data: response
        });
      } catch (ex) {
        throw ex;
      }
    }
  });
}