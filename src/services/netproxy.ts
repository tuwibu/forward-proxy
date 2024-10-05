import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const COUNTRY = process.env.COUNTRY || ''

// {
//   "success": true,
//   "data": {
//       "proxy": "104.214.186.198:47361",
//       "refreshAt": "2024-08-30T13:47:19.818Z",
//       "nextChange": 120,
//       "acceptIp": "171.252.154.194",
//       "isResidential": true
//   }
// }

export const ChangeNetProxy = async (apiKey: string): Promise<string> => {
  try {
    const response = await axios({
      method: 'GET',
      url: 'https://api.netproxy.io/api/rotateProxy/getNewProxy',
      params: {
        apiKey,
        country: COUNTRY,
      },
    })
    if (response?.data?.data?.proxy) {
      console.log('response.data.data.proxy', response.data.data.proxy)
      return response.data.data.proxy
    } else {
      throw new Error(response.data.message)
    }
  } catch (ex) {
    throw ex
  }
}