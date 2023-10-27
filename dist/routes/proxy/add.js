"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typebox_1 = require("@sinclair/typebox");
const utils_1 = require("../../utils");
const cluster_1 = __importDefault(require("../../cluster"));
var ProxyType;
(function (ProxyType) {
    ProxyType["tinsoftproxy"] = "tinsoftproxy";
    ProxyType["tmproxy"] = "tmproxy";
    ProxyType["proxyxoay"] = "proxyxoay";
})(ProxyType || (ProxyType = {}));
const BodySchema = typebox_1.Type.Object({
    apiKey: typebox_1.Type.String(),
    type: typebox_1.Type.Enum(ProxyType),
    destination: typebox_1.Type.Optional(typebox_1.Type.String())
});
exports.default = (fastify) => __awaiter(void 0, void 0, void 0, function* () {
    fastify.route({
        method: "PUT",
        url: "/",
        schema: {
            body: BodySchema
        },
        handler: (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { apiKey, type, destination } = request.body;
                const checkApiKey = yield fastify.prisma.proxy.findUnique({
                    where: {
                        apiKey
                    }
                });
                if (checkApiKey) {
                    throw new Error("API Key already exists");
                }
                var port = (0, utils_1.random)(10000, 60000);
                while (true) {
                    port = (0, utils_1.random)(10000, 60000);
                    const checkPort = yield fastify.prisma.proxy.findUnique({
                        where: {
                            port
                        }
                    });
                    if (!checkPort) {
                        break;
                    }
                }
                cluster_1.default.addWorker(port);
                const response = yield fastify.prisma.proxy.create({
                    data: {
                        apiKey,
                        type,
                        port,
                        destination
                    }
                });
                reply.send({
                    success: true,
                    data: response
                });
            }
            catch (ex) {
                throw ex;
            }
        })
    });
});
