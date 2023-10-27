import axios from "axios";

export const ChangeProxyXoay = async (apiKey: string) => {
  try {
    const response = await axios.get(`https://proxyxoay.net/api/rotating-proxy/change-key-ip/${apiKey}`);
    return response.data;
  } catch(ex) {
    throw ex;
  }
}