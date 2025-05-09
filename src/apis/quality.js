import axios from "axios";
import API_URL from "../constants/Constants";
import { loggedInUser } from "../utils/loggedInUser";

export const getHighgrades = async (page, limit) => {
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

export const createMoistureContent = async (
  batchNo,
  MoistureOne,
  MoistureTwo,
  ProcessingType
) => {
  const loggedinuser = loggedInUser();
  const keyOne =
    ProcessingType == "NATURAL"
      ? "N1"
      : ProcessingType === "HONEY"
      ? "H1"
      : "A1";
  const keyTWO =
    ProcessingType == "NATURAL"
      ? "N2"
      : ProcessingType === "HONEY"
      ? "H2"
      : "A2";
  const payload = {
    batches: [
      {
        batchNo: batchNo,
        cwsMoisture1: {
          [keyOne]: MoistureOne,
          [keyTWO]: MoistureTwo,
        },
      },
    ],
  };
  try {
    const res = await axios.post(
      `${API_URL}/quality/sendBatchToTest`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${loggedinuser?.token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res?.data;
  } catch (error) {
    return error;
  }
};

export const getQualityBatchesInTesting = async (page, limit) => {
  const loggedinuser = loggedInUser();
  try {
    const res = await axios.get(
      `${API_URL}/quality/getAllBatchesInTesting?page=${page}&limit=${limit}`,

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
