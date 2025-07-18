import axios from "axios";
import API_URL from "../constants/Constants";
import { loggedInUser } from "../utils/loggedInUser";

export const getHighgrades = async (page, limit) => {
  const loggedinuser = loggedInUser();
  try {
    const res = await axios.get(
      `${API_URL}/batches/sample/gradeA/${loggedinuser?.cwsId}?page=${page}&limit=${limit}`,

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
      : "A0";
  const keyTWO =
    ProcessingType == "NATURAL"
      ? "N2"
      : ProcessingType === "HONEY"
      ? "H2"
      : "A1";
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
      loggedinuser.role == "ADMIN" || loggedinuser.role == "QUALITY"
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

  const new_payload = payload?.map((element) => {
    const keys =
      element?.processingType === "NATURAL"
        ? { key1: "N1", key2: "N2" }
        : element?.processingType === "HONEY"
        ? { key1: "H1", key2: "H2" }
        : { key1: "A0", key2: "A1" };
    return {
      batchNo: element?.id,
      labMoisture: {
        [keys.key1]: element?.labMoisture["A0"] ?? "",
        [keys.key2]: element?.labMoisture["A1"] ?? "",
      },
      cwsMoisture1: {
        [keys.key1]: element?.cwsMoisture["A0"] ?? "",
        [keys.key2]: element?.cwsMoisture["A1"] ?? "",
      },
      screen: {
        [keys.key1]: {
          14: element["14+"]["A0"] ?? "",
          "16+": element["16+"]["A0"] ?? "",
          15: element["15+"]["A0"] ?? "",
          13: element["13+"]["A0"],
          "B/12": element["B/12"]["A0"] ?? "",
        },
        [keys.key2]: {
          14: element["14+"]["A1"] ?? "",
          "16+": element["16+"]["A1"] ?? "",
          15: element["15+"]["A1"] ?? "",
          13: element["13+"]["A1"] ?? "",
          "B/12": element["B/12"]["A1"] ?? "",
        },
      },
      defect: {
        [keys.key1]: element?.deffect["A0"] ?? "",
        [keys.key2]: element?.deffect["A1"] ?? "",
      },
      ppScore: {
        [keys.key1]: element?.ppScore["A0"] ?? "",
        [keys.key2]: element?.ppScore["A1"] ?? "",
      },
      sampleStorageId_0: element?.sampleStorage["A0"],
      sampleStorageId_1: element?.sampleStorage["A1"],
      notes: {
        [keys.key1]: "Sample A0 notes",
        [keys.key2]: "Sample A1 notes",
      },
      category: {
        [keys.key1]: parseInt(element?.category["A1"], 10) ?? "",
        [keys.key2]: parseInt(element?.category["A2"], 10) ?? "",
      },
    };
  });

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

export const updateQualityInformationOnDelivary = async (payload) => {
  const loggedinuser = loggedInUser();
  const new_payload = payload?.map((element) => {
    return [
      {
        // id: element?.id["A1"],
        batchNo: element?.batchId,
        // transferId: element?.transferId["A1"],

        screen: {
          14: element["14+"]["A1"] ?? "",
          16: element["16+"]["A1"] ?? "",
          15: element["15+"]["A1"] ?? "",
          13: element["13+"]["A1"],
          "B/12": element["B/12"]["A1"] ?? "",
        },
        defect: element?.deffect["A1"] ?? "",
        ppScore: element?.ppScore["A1"] ?? "",
        sampleStorageId: element?.sampleStorage["A1"],
        notes: "",
      },
      {
        // id: element?.id["A0"],
        batchNo: element?.batchId,
        // transferId: element?.transferId["A0"],

        screen: {
          14: element["14+"]["A0"] ?? "",
          16: element["16+"]["A0"] ?? "",
          15: element["15+"]["A0"] ?? "",
          13: element["13+"]["A0"],
          "B/12": element["B/12"]["A0"] ?? "",
        },
        defect: element?.deffect["A0"] ?? "",
        ppScore: element?.ppScore["A0"] ?? "",
        sampleStorageId: element?.sampleStorage["A0"],
        notes: "",
      },
    ];
  });


  try {
    const res = await axios.put(
      `${API_URL}/quality-delivery/send-delivery-test-result`,
      { batches: new_payload?.flat(1) },
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
