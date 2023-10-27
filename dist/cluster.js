"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const logger_1 = __importDefault(require("./helpers/logger"));
class Cluster {
    constructor() {
        this.workerList = {};
    }
    addWorker(port) {
        this.workerList[port] = new worker_threads_1.Worker("./dist/worker.js", {
            workerData: {
                port
            }
        });
        this.workerList[port].on("message", (message) => {
            logger_1.default.info(message);
        });
        this.workerList[port].on("error", (error) => {
            logger_1.default.error(error);
        });
        this.workerList[port].on("exit", (code) => {
            logger_1.default.error(`Worker stopped with exit code ${code}`);
        });
    }
    removeWorker(port) {
        if (this.workerList[port]) {
            // this.workerList[port].terminate();
            this.workerList[port].postMessage({
                exit: true
            });
            delete this.workerList[port];
        }
    }
}
exports.default = new Cluster();
