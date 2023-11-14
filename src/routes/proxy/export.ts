import { FastifyInstance } from "fastify";

const SITE_URL = process.env.SITE_URL;
const AUTH_PROXYXOAY = process.env.AUTH_PROXYXOAY;

export default async (fastify: FastifyInstance) => {
  fastify.route({
    method: "GET",
    url: "/export",
    handler: async (request, reply) => {
      try {
        const response = await fastify.prisma.proxy.findMany({
          orderBy: {
            createdAt: "asc"
          }
        });
        let list = "";
        for (const proxy of response) {
          if (proxy.type === "proxyxoay") {
            // list += `${AUTH_PROXYXOAY}@${proxy.destination}\n`;
            list += `${proxy.destination}:${AUTH_PROXYXOAY}\n`;
          } else {
            list += `${SITE_URL}:${proxy.port}\n`;
          }
        }
        reply.header("Content-Type", "text/plain");
        reply.send(list);
      } catch (ex) {
        throw ex;
      }
    }
  });
}