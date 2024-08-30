import { Worker } from 'worker_threads'
import logger from './helpers/logger'

class Cluster {
  private workerList: {
    [port: number]: Worker
  } = {}

  addWorker(port: number) {
    this.workerList[port] = new Worker('./dist/worker.js', {
      workerData: {
        port,
      },
    })
    this.workerList[port].on('message', (message) => {
      logger.info(message)
    })
    this.workerList[port].on('error', (error) => {
      logger.error(error)
    })
    this.workerList[port].on('exit', (code) => {
      logger.error(`Worker stopped with exit code ${code}`)
    })
  }

  removeWorker(port: number) {
    if (this.workerList[port]) {
      // this.workerList[port].terminate();
      this.workerList[port].postMessage({
        exit: true,
      })
      delete this.workerList[port]
    }
  }
}

export default new Cluster()
