import { isMainThread, parentPort, workerData } from "worker_threads";
import logger from "./helpers/logger";
import * as ProxyChain from "proxy-chain";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const AUTH_PROXYXOAY = process.env.AUTH_PROXYXOAY || "";
(async () => {
  if (!isMainThread) {
    parentPort.on("message", (message) => {
      if (message.exit) {
        process.exit(0);
      }
    });
    const prisma = new PrismaClient({});
    try {
      const { port } = workerData;
      logger.info(`Worker started on port ${port}`);
      const server = new ProxyChain.Server({
        port: port,
        verbose: true,
        prepareRequestFunction: async () => {
          const result = await prisma.proxy.findUnique({
            where: {
              port: port,
            },
          })
          if (result === null) {
            console.error("Port not found", port)
            await prisma.$disconnect()
            process.exit(1)
          }
          if (result.type == "proxyxoay") {
            return {
              upstreamProxyUrl: `http://${AUTH_PROXYXOAY ? `${AUTH_PROXYXOAY}@` : ""}${result.destination}`,
            }
          }
          return {
            upstreamProxyUrl: `http://${result.destination}`,
          }
        },
      })
      server.listen(() => {
        logger.info(`Proxy server is listening on port ${port}`)
      })
      server.on("requestFailed", async ({ request, error }) => {
        logger.error(`Request failed: ${request.url}`)
        logger.error(error)
      })
    } catch (ex) {
      logger.error(ex);
      await prisma.$disconnect();
      process.exit(1);
    }
  }
})()