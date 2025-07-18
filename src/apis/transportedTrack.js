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
      const loggedinuser = loggedInUser();
  try {
    const res = await axios.post(`${API_URL}/stock/stock-delivery`, payload,{
        headers: {
          Authorization: `Bearer ${loggedinuser?.token}`,
        },
      });
    return res?.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || "Failed to create stock delivery record");
  }
};



export const getTransportedTrackById = async (transportGroupId, transferDate) => {
  const loggedinuser = loggedInUser();
  try {
    const res = await axios.get(
      `${API_URL}/stock/transported-trucks/${transportGroupId}/${transferDate}`,
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