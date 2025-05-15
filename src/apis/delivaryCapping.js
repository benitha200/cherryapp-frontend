import axios from "axios";
import API_URL from "../constants/Constants";
import { loggedInUser } from "../utils/loggedInUser";

export const getDelivaries = async (page, limit) => {
  const loggedinuser = loggedInUser();
  try {
    const res = await axios.get(
      `${API_URL}/quality-delivery/get-all-grouped-trucks`,

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

export const getDelivaryById = async (id) => {
  const loggedinuser = loggedInUser();
  try {
    const res = await axios.get(
      `${API_URL}/quality-delivery/getBatches-by-truck/${id}?page=1&limit=10`,

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

export const updateDelivaryById = async ({ id, payload }) => {
  const new_payload = payload?.activatedBatchesData?.map((element) => {
    return [
      {
        id: element?.spId["A1"],
        transferId: element?.transferId["A1"],
        labMoisture: Number(element?.labMoisture["A1"]),
        screen: {
          14: element[14]["A1"] ?? "",
          16: element[16]["A1"] ?? "",
          15: element[15]["A1"] ?? "",
          13: element[13]["A1"],
          "B/12": element["B/12"]["A1"] ?? "",
        },
        defect: element?.deffect["A1"] ?? "",
        ppScore: element?.ppScore["A1"] ?? "",
        sampleStorageId: element?.storage["A1"],
        notes: "",
      },
      {
        id: element?.spId["A0"],
        transferId: element?.transferId["A0"],
        labMoisture: Number(element?.labMoisture["A0"]),
        screen: {
          14: element["14"]["A0"] ?? "",
          16: element["16"]["A0"] ?? "",
          15: element["15"]["A0"] ?? "",
          13: element["13"]["A0"],
          "B/12": element["B/12"]["A0"] ?? "",
        },
        defect: element?.deffect["A0"] ?? "",
        ppScore: element?.ppScore["A0"] ?? "",
        sampleStorageId: element?.storage["A0"],
        notes: "",
      },
    ];
  });

  const loggedinuser = loggedInUser();
  const payloadsxxx = {
    batches: new_payload?.flat(1),
    categoryKgs: payload?.info,
  };
  console.log("::::::::::payload", payloadsxxx);

  try {
    const res = await axios.put(
      `${API_URL}/quality-delivery/send-delivery-test-result`,
      { batches: new_payload?.flat(1), categoryKgs: payload?.info },
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
