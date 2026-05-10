import axios from "axios";
import { API_BASE } from "../utils/constants";

const API = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
