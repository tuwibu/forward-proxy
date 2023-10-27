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
Object.defineProperty(exports, "__esModule", { value: true });
const SITE_URL = process.env.SITE_URL;
exports.default = (fastify) => __awaiter(void 0, void 0, void 0, function* () {
    fastify.route({
        method: "GET",
        url: "/export",
        handler: (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const response = yield fastify.prisma.proxy.findMany({});
                let list = "";
                for (const proxy of response) {
                    list += `${SITE_URL}:${proxy.port}\n`;
                }
                reply.header("Content-Type", "text/plain");
                reply.send(list);
            }
            catch (ex) {
                throw ex;
            }
        })
    });
});
