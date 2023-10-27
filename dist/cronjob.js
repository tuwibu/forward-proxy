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
exports.ResetProxy = void 0;
const proxyxoay_1 = require("./services/proxyxoay");
const tinsoftproxy_1 = require("./services/tinsoftproxy");
const tmproxy_1 = require("./services/tmproxy");
const logger_1 = __importDefault(require("./helpers/logger"));
const ResetProxy = (prisma) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lists = yield prisma.proxy.findMany({
            where: {
                updatedAt: {
                    lt: new Date(Date.now() - 120000)
                }
            }
        });
        for (const proxy of lists) {
            try {
                logger_1.default.info(`Reset proxy ${proxy.apiKey} (${proxy.type})`);
                if (proxy.type === "proxyxoay") {
                    yield (0, proxyxoay_1.ChangeProxyXoay)(proxy.apiKey);
                }
                else if (proxy.type === "tinsoftproxy") {
                    const destination = yield (0, tinsoftproxy_1.ChangeTinsoftProxy)(proxy.apiKey);
                    yield prisma.proxy.update({
                        where: {
                            apiKey: proxy.apiKey
                        },
                        data: {
                            destination
                        }
                    });
                }
                else if (proxy.type === "tmproxy") {
                    const destination = yield (0, tmproxy_1.ChangeTmProxy)(proxy.apiKey);
                    yield prisma.proxy.update({
                        where: {
                            apiKey: proxy.apiKey
                        },
                        data: {
                            destination
                        }
                    });
                }
            }
            catch (ex) {
            }
        }
    }
    catch (ex) {
        throw ex;
    }
});
exports.ResetProxy = ResetProxy;
