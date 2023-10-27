import { FastifyInstance } from "fastify";

const SITE_URL = process.env.SITE_URL;

export default async (fastify: FastifyInstance) => {
  fastify.route({
    method: "GET",
    url: "/export",
    handler: async (request, reply) => {
      try {
        const response = await fastify.prisma.proxy.findMany({});
        let list = "";
        for (const proxy of response) {
          list += `${SITE_URL}:${proxy.port}\n`;
        }
        reply.header("Content-Type", "text/plain");
        reply.send(list);
      } catch (ex) {
        throw ex;
      }
    }
  });
}