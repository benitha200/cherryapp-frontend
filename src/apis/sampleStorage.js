import axios from "axios";
import API_URL from "../constants/Constants";
import { loggedInUser } from "../utils/loggedInUser";

export const sampleStorage = async () => {
  const loggedinuser = loggedInUser();
  try {
    const res = await axios.get(
      `${API_URL}/sample-storage/getAll`,

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
