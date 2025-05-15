import { loggedInUser } from "../utils/loggedInUser";
import API_URL from "../constants/Constants";

const findAllDeliveringTracks = async (page, limit) => {
  const loggedinuser = loggedInUser();
  try {
    const res = await axios.get(
      `${API_URL}/processings/batch/gradeA/${loggedinuser?.cwsId}?page=${page}&limit=${limit}`,

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

const searchDeriveringTracks = async (page, limit) => {
  const loggedinuser = loggedInUser();
  try {
    const res = await axios.get(
      `${API_URL}/processings/batch/gradeA/${loggedinuser?.cwsId}?page=${page}&limit=${limit}`,

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
