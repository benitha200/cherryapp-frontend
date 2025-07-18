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
      `${API_URL}/quality-delivery/getBatches-by-truck/${id?.trackId}/${id?.transferDate}/${id.transferGroupId}? page = 1 & limit= 2000`,

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
  const sv = [];
  payload?.activatedBatchesData?.map((element) => {

    if (!isNaN(element?.transferId["A1"])) {
      sv.push({
        id: element?.spId["A1"],
        transferId: Number(element?.transferId["A1"] || ""),
        labMoisture: Number(element?.labMoisture["A1"]),
        screen: {
          14: element[14]["A1"] ?? "",
          "16+": element[16]["A1"] ?? "",
          15: element[15]["A1"] ?? "",
          13: element[13]["A1"],
          "B/12": element["B/12"]["A1"] ?? "",
        },
        defect: Number(element?.deffect["A1"]) ?? "",
        ppScore: Number(element?.ppScore["A1"]) ?? "",
        sampleStorageId: element?.storage["A1"],
        notes: "",
      });
    }
    if (!isNaN(element?.transferId["A0"])) {
      sv.push({
        id: element?.spId["A0"],
        transferId: Number(element?.transferId["A0"]),
        labMoisture: Number(element?.labMoisture["A0"]),
        screen: {
          14: element["14"]["A0"] ?? "",
          "16+": element["16"]["A0"] ?? "",
          15: element["15"]["A0"] ?? "",
          13: element["13"]["A0"],
          "B/12": element["B/12"]["A0"] ?? "",
        },
        defect: Number(element?.deffect["A0"]) ?? "",
        ppScore: Number(element?.ppScore["A0"]) ?? "",
        sampleStorageId: element?.storage["A0"],
        notes: "",
      });
    }
  });

  const loggedinuser = loggedInUser();

  delete payload?.categories?.relatedCategories;
  try {
    const res = await axios.put(
      `${API_URL}/quality-delivery/send-delivery-test-result`,
      { batches: sv, categoryKgs: payload?.categories },
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

export const getAllTrucksWithDetailedBatches = async () => {
  const loggedinuser = loggedInUser();
  try {
    const res = await axios.get(
      `${API_URL}/quality-delivery/get-all-trucks-with-detailed-batches`,
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
