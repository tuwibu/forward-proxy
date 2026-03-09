import { FastifyInstance } from 'fastify'
import { Static, Type } from '@sinclair/typebox'
import { random } from '../../utils'
import cluster from '../../cluster'

// enum ProxyType {
//   tinsoftproxy = 'tinsoftproxy',
//   tmproxy = 'tmproxy',
//   proxyxoay = 'proxyxoay',
//   netproxy = 'netproxy',
// }

const BodySchema = Type.Object({
  apiKey: Type.String(),
  type: Type.String(),
  destination: Type.Optional(Type.String()),
})

export default async (fastify: FastifyInstance) => {
  fastify.route<{
    Body: Static<typeof BodySchema>
  }>({
    method: 'PUT',
    url: '/',
    schema: {
      body: BodySchema,
    },
    handler: async (request, reply) => {
      try {
        const { apiKey, type, destination } = request.body
        const checkApiKey = await fastify.prisma.proxy.findUnique({
          where: {
            apiKey,
          },
        })
        if (checkApiKey) {
          throw new Error('API Key already exists')
        }
        const portMin = parseInt(process.env.PORT_MIN || '10000')
        const portMax = parseInt(process.env.PORT_MAX || '11000')
        var port = random(portMin, portMax)
        while (true) {
          port = random(portMin, portMax)
          const checkPort = await fastify.prisma.proxy.findUnique({
            where: {
              port,
            },
          })
          if (!checkPort) {
            break
          }
        }
        cluster.addWorker(port)
        const response = await fastify.prisma.proxy.create({
          data: {
            apiKey,
            type,
            port,
            destination,
          },
        })
        reply.send({
          success: true,
          data: response,
        })
      } catch (ex) {
        throw ex
      }
    },
  })
}
