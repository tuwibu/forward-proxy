import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { ChangeProxyXoay } from "./services/proxyxoay";
import { ChangeTinsoftProxy } from "./services/tinsoftproxy";
import { ChangeTmProxy } from "./services/tmproxy";
import logger from "./helpers/logger";
export const ResetProxy = async (prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>) => {
  try {
    const lists = await prisma.proxy.findMany({
      where: {
        updatedAt: {
          lt: new Date(Date.now() - 120000)
        }
      }
    });
    for(const proxy of lists) {
      try {
        logger.info(`Reset proxy ${proxy.apiKey} (${proxy.type})`);
        if (proxy.type === "proxyxoay") {
          await ChangeProxyXoay(proxy.apiKey);
        } else if (proxy.type === "tinsoftproxy") {
          const destination = await ChangeTinsoftProxy(proxy.apiKey);
          await prisma.proxy.update({
            where: {
              apiKey: proxy.apiKey
            },
            data: {
              destination
            }
          });
        } else if (proxy.type === "tmproxy") {
          const destination = await ChangeTmProxy(proxy.apiKey);
          await prisma.proxy.update({
            where: {
              apiKey: proxy.apiKey
            },
            data: {
              destination
            }
          });
        }
      } catch(ex) {

      }
    }
  } catch(ex) {
    throw ex;
  }
}