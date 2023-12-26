import path from "path";
import dotenv from "dotenv";
import fastify from "fastify";
import autoload from "@fastify/autoload";
import cron from "node-cron";
import prisma from "./plugins/prisma";
import { ResetProxy } from "./cronjob";
import cluster from "./cluster";

dotenv.config();

const CRONTAB = process.env.CRONTAB || "* * * * *";

const app = fastify({
  logger: {
    level: "info"
  },
});
app.register(prisma);
// middleware
app.setErrorHandler((error, request, reply) => {
  return reply.send({
    success: false,
    message: error.message
  });
});
app.register(autoload, {
  dir: path.resolve(__dirname, "routes"),
  dirNameRoutePrefix: true
});
app.get("/", async (request, reply) => {
  reply.send({
    copyright: `© ${new Date().getFullYear()}`
  });
});


app.listen({
  port: parseInt(process.env.PORT || "5000"),
  host: "0.0.0.0"
}, async(err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  app.prisma.proxy.findMany({}).then((proxies) => {
    proxies.forEach((proxy) => {
      if (proxy.port) {
        cluster.addWorker(proxy.port);
      }
    });
  });
  console.log(`Server listening at ${address}`);
  cron.schedule(CRONTAB, async () => {
    await ResetProxy(app.prisma);
  });
});