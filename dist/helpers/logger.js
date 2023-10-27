"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const colorette_1 = require("colorette");
const dayjs_1 = __importDefault(require("dayjs"));
const logger = ({ level, message }) => {
    level === "log" && (level = "info");
    let levelFormat = "";
    switch (level) {
        case "error":
            levelFormat = (0, colorette_1.red)(`[${level}]`);
            break;
        case "warn":
            levelFormat = (0, colorette_1.yellow)(`[${level}]`);
            break;
        case "debug":
            levelFormat = (0, colorette_1.blue)(`[${level}]`);
            break;
        case "success":
            levelFormat = (0, colorette_1.green)(`[${level}]`);
            break;
        default:
            levelFormat = (0, colorette_1.cyan)(`[${level}]`);
            break;
    }
    const dateFormat = (0, colorette_1.gray)(`[${(0, dayjs_1.default)().format("DD/MM/YYYY HH:mm:ss")}]`);
    if (level === "success")
        level = "log";
    console[level](dateFormat, levelFormat, ...message);
};
exports.default = {
    log: (...args) => {
        logger({
            level: "log",
            message: args
        });
    },
    info: (...args) => {
        logger({
            level: "info",
            message: args
        });
    },
    success: (...args) => {
        logger({
            level: "success",
            message: args
        });
    },
    warn: (...args) => {
        logger({
            level: "warn",
            message: args
        });
    },
    error: (...args) => {
        logger({
            level: "error",
            message: args
        });
    },
    debug: (...args) => {
        logger({
            level: "debug",
            message: args
        });
    }
};
