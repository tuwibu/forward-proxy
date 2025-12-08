import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const REGION = process.env.REGION || 'bac'

export const ChangeKiotProxy = async (apiKey: string): Promise<string> => {
  try {
    const response = await axios({
      method: 'GET',
      //https://api.kiotproxy.com/api/v1/proxies/new?key=K98ce716...bbc89&region=bac
      //https://api.kiotproxy.com/api/v1/proxies/out?key=K98ce716...bbc89
      url: `https://api.kiotproxy.com/api/v1/proxies/new?key=${apiKey}&region=${REGION}`,
    })
    //console.log(`ChangeKiotProxy response: ${response.data.data.http}`)
    if (response.data.success) {
      return response.data.data.http
    } else {
      throw new Error(response.data.message)
    }
  } catch (ex) {
    throw ex
  }
}
