import axios from "axios";
import API_URL from "../constants/Constants";
import { loggedInUser } from "../utils/loggedInUser";

export const getDelivary = async (page, limit) => {
  const loggedinuser = loggedInUser();
  try {
    const res = await axios.get(
      `${API_URL}/quality-delivery/getBatches-delivery-testing?page=${page}&limit=${limit}`,

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
