import { FastifyInstance } from "fastify";
import { Static, Type } from "@sinclair/typebox";

const BodySchema = Type.Object({
  apiKey: Type.String(),
});

export default async (fastify: FastifyInstance) => {
  fastify.route<{
    Body: Static<typeof BodySchema>
  }>({
    method: "DELETE",
    url: "/",
    schema: {
      body: BodySchema
    },
    handler: async (request, reply) => {
      try {
        const { apiKey } = request.body;
        await fastify.prisma.proxy.delete({
          where: {
            apiKey
          }
        });
        reply.send({
          success: true
        });
      } catch (ex) {
        throw ex;
      }
    }
  });
}