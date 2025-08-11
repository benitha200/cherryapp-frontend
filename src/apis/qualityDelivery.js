import axios from "axios";
import API_URL from "../constants/Constants";
import { loggedInUser } from "../utils/loggedInUser";

export const createQualityDeliveryOnTrack = async (payload) => {
  const loggedinuser = loggedInUser();
  try {
    const res = await axios.post(
      `${API_URL}/quality-delivery/create-quality-delivery`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${loggedinuser?.token}`,
        },
      }
    );
    return res?.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || "Failed to create stock delivery record"
    );
  }
};


export const getTransportedTrackById = async (transportGroupId) => {
  const loggedinuser = loggedInUser();
  try {
    const res = await axios.get(
      `${API_URL}/quality-delivery/by-transport-group/${transportGroupId}`,
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