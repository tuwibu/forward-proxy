import { Prisma, PrismaClient } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import { ChangeProxyXoay } from './services/proxyxoay'
import { ChangeTinsoftProxy } from './services/tinsoftproxy'
import { ChangeTmProxy } from './services/tmproxy'
import { ChangeKiotProxy } from './services/kiotproxy'
import logger from './helpers/logger'
import dotenv from 'dotenv'
import { ChangeNetProxy } from './services/netproxy'
dotenv.config()

const RESET_PROXY_INTERVAL = process.env.RESET_PROXY_INTERVAL || 60000

export const ResetProxy = async (prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, force = false) => {
  try {
    const lists = await prisma.proxy.findMany({
      where: force
        ? {}
        : {
            updatedAt: {
              lt: new Date(Date.now() - Number(RESET_PROXY_INTERVAL)),
            },
          },
    })
    for (const proxy of lists) {
      try {
        logger.info(`Reset proxy ${proxy.apiKey} (${proxy.type})`)
        if (proxy.type === 'proxyxoay') {
          await ChangeProxyXoay(proxy.apiKey)
        } else if (proxy.type === 'tinsoftproxy') {
          const destination = await ChangeTinsoftProxy(proxy.apiKey)
          await prisma.proxy.update({
            where: {
              apiKey: proxy.apiKey,
            },
            data: {
              destination,
            },
          })
        } else if (proxy.type === 'tmproxy') {
          const destination = await ChangeTmProxy(proxy.apiKey)
          await prisma.proxy.update({
            where: {
              apiKey: proxy.apiKey,
            },
            data: {
              destination,
            },
          })
        } else if (proxy.type === 'netproxy') {
          const destination = await ChangeNetProxy(proxy.apiKey)
          await prisma.proxy.update({
            where: {
              apiKey: proxy.apiKey,
            },
            data: {
              destination,
            },
          })
        }
        else if (proxy.type === 'kiotproxy') {
          const destination = await ChangeKiotProxy(proxy.apiKey)
          await prisma.proxy.update({
            where: {
              apiKey: proxy.apiKey,
            },
            data: {
              destination,
            },
          })
        }
      } catch (ex) {
        logger.error(ex)
      }
    }
  } catch (ex) {
    throw ex
  }
}
