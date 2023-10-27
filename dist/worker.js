"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const worker_threads_1 = require("worker_threads");
const logger_1 = __importDefault(require("./helpers/logger"));
const ProxyChain = __importStar(require("proxy-chain"));
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const AUTH_PROXYXOAY = process.env.AUTH_PROXYXOAY || "";
(() => __awaiter(void 0, void 0, void 0, function* () {
    if (!worker_threads_1.isMainThread) {
        worker_threads_1.parentPort.on("message", (message) => {
            if (message.exit) {
                process.exit(0);
            }
        });
        const prisma = new client_1.PrismaClient({});
        try {
            const { port } = worker_threads_1.workerData;
            logger_1.default.info(`Worker started on port ${port}`);
            const server = new ProxyChain.Server({
                port: port,
                verbose: true,
                prepareRequestFunction: () => __awaiter(void 0, void 0, void 0, function* () {
                    const result = yield prisma.proxy.findUnique({
                        where: {
                            port: port,
                        },
                    });
                    if (result === null) {
                        console.error("Port not found", port);
                        yield prisma.$disconnect();
                        process.exit(1);
                    }
                    if (result.type == "proxyxoay") {
                        return {
                            upstreamProxyUrl: `http://${AUTH_PROXYXOAY ? `${AUTH_PROXYXOAY}@` : ""}${result.destination}`,
                        };
                    }
                    return {
                        upstreamProxyUrl: `http://${result.destination}`,
                    };
                }),
            });
            server.listen(() => {
                logger_1.default.info(`Proxy server is listening on port ${port}`);
            });
            server.on("requestFailed", ({ request, error }) => __awaiter(void 0, void 0, void 0, function* () {
                logger_1.default.error(`Request failed: ${request.url}`);
                logger_1.default.error(error);
            }));
        }
        catch (ex) {
            logger_1.default.error(ex);
            yield prisma.$disconnect();
            process.exit(1);
        }
    }
}))();
