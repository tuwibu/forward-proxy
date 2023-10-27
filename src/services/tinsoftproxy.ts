import axios from "axios";

export const ChangeTinsoftProxy = async (apiKey: string): Promise<string> => {
  try {
    const response = await axios({
      method: "GET",
      url: `http://proxy.tinsoftsv.com/api/changeProxy.php?key=${apiKey}`
    });
    if (response.data.success) {
      return response.data.proxy;
    } else {
      throw new Error(response.data.description);
    }
  } catch(ex) {
    throw ex;
  }
}