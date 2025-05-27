import axios from "axios";
import { loggedInUser } from "../utils/loggedInUser";
import API_URL from "../constants/Constants";

export const getAllStocksInfo = async () => {
  const loggedinuser = loggedInUser();
  try {
    const res = await axios.get(
      `${API_URL}/stock/report`,

      {
        headers: {
          Authorization: `Bearer ${loggedinuser?.token}`,
        },
      }
    );
    return res?.data;
  } catch (error) {
    return error;
  }
};
