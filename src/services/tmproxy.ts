import axios from 'axios'

export const ChangeTmProxy = async (apiKey: string): Promise<string> => {
  try {
    const response = await axios({
      method: 'POST',
      url: 'https://tmproxy.com/api/proxy/get-new-proxy',
      headers: {
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({
        api_key: apiKey,
      }),
    })
    if (response.data.code === 0) {
      return response.data.data.https
    } else {
      throw new Error(response.data.message)
    }
  } catch (ex) {
    throw ex
  }
}
