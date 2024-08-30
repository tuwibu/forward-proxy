import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const COUNTRY = process.env.COUNTRY || ''

export const ChangeNetProxy = async (apiKey: string) => {
  try {
    const response = await axios({
      method: 'GET',
      url: 'https://api.netproxy.io/api/rotateProxy/getNewProxy',
      params: {
        apiKey,
        country: COUNTRY,
      },
    })
    return response.data
  } catch (ex) {
    throw ex
  }
}