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
      loggedinuser.role == "ADMIN"
        ? `${API_URL}/quality/getAllBatchesInTesting?page=${page}&limit=${limit}`
        : `${API_URL}/quality/getBatchesInTestingBycws/${loggedinuser?.cwsId}?page=${page}&limit=${limit}`,

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

export const updateQualityInformation = async (payload) => {
  const loggedinuser = loggedInUser();
  console.log(payload);
  const new_payload = payload?.map((element) => {
    return {
      batchNo: element?.id,
      labMoisture: {
        A0: element?.labMoisture["A0"] ?? "",
        A1: element?.labMoisture["A1"] ?? "",
      },
      screen: {
        A0: {
          14: element["14+"]["A0"] ?? "",
          "16+": element["16+"]["A0"] ?? "",
          "15+": element["15+"]["A0"] ?? "",
          13: element["13+"]["A0"],
          "B/12": element["B/12"]["A0"] ?? "",
        },
        A1: {
          14: element["14+"]["A1"] ?? "",
          "16+": element["16+"]["A1"] ?? "",
          "15+": element["15+"]["A1"] ?? "",
          13: element["13+"]["A1"] ?? "",
          "B/12": element["B/12"]["A1"] ?? "",
        },
      },
      defect: {
        A0: element?.deffect["A0"] ?? "",
        A1: element?.deffect["A1"] ?? "",
      },
      ppScore: {
        A0: element?.ppScore["A0"] ?? "",
        A1: element?.ppScore["A1"] ?? "",
      },
      sampleStorageId_0: 2,
      sampleStorageId_1: 2,
      notes: {
        A0: "Sample A0 notes",
        A1: "Sample A1 notes",
      },
      category: {
        A0: element?.category["A1"] ?? "",
        A1: element?.category["A2"] ?? "",
      },
    };
  });

  console.log(new_payload);
  try {
    const res = await axios.put(
      `${API_URL}/quality/sendTestResult`,
      { batches: new_payload },
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
