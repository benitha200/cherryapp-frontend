import axios from "axios";
import API_URL from "../constants/Constants";

export const login = async ({ payload }) => {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, payload);
    return res?.data;
  } catch (error) {
    throw new Error("Invalid username or password");
  }
};
