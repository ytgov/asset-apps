import axios from "axios";

import { apiBaseUrl as API_BASE_URL } from "@/config";

export default axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});
