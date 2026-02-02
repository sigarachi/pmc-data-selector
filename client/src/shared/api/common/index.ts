import { options } from "@shared/config";
import axios from "axios";

export const network = axios.create({
  baseURL: options.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});
