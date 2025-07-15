import axios from "axios";
import API_URL from "../constants/Constants";
import { loggedInUser } from "../utils/loggedInUser";

export const transportedTruck = async () => {
  const loggedinuser = loggedInUser();
  try {
    const res = await axios.get(
      `${API_URL}/stock/transported-trucks/`,
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


export const createStockDeliveryRecord = async (payload) => {
  console.log("Payload in createStockDeliveryRecord::::::::::::::", payload);
      const loggedinuser = loggedInUser();
  try {
    const res = await axios.post(`${API_URL}/stock/stock-delivery`, payload,{
        headers: {
          Authorization: `Bearer ${loggedinuser?.token}`,
        },
      });
    return res?.data;
  } catch (error) {
    throw new Error("Invalid username or password");
  }
};