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
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const fastify_1 = __importDefault(require("fastify"));
const autoload_1 = __importDefault(require("@fastify/autoload"));
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = __importDefault(require("./plugins/prisma"));
const cronjob_1 = require("./cronjob");
const cluster_1 = __importDefault(require("./cluster"));
dotenv_1.default.config();
const app = (0, fastify_1.default)({
    logger: {
        level: "info"
    },
});
app.register(prisma_1.default);
// middleware
app.setErrorHandler((error, request, reply) => {
    return reply.send({
        success: false,
        message: error.message
    });
});
app.register(autoload_1.default, {
    dir: path_1.default.resolve(__dirname, "routes"),
    dirNameRoutePrefix: true
});
app.get("/", (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    reply.send({
        copyright: `© ${new Date().getFullYear()}`
    });
}));
app.listen({
    port: parseInt(process.env.PORT || "5000")
}, (err, address) => __awaiter(void 0, void 0, void 0, function* () {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    app.prisma.proxy.findMany({}).then((proxies) => {
        proxies.forEach((proxy) => {
            if (proxy.port) {
                cluster_1.default.addWorker(proxy.port);
            }
        });
    });
    console.log(`Server listening at ${address}`);
    node_cron_1.default.schedule("* * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, cronjob_1.ResetProxy)(app.prisma);
    }));
}));
