import axios from "axios";
import { envs } from "../config";

const axiosInstance = axios.create({
  baseURL: envs.VITE_API_URL,
});

axiosInstance.interceptors.request.use((config) => {
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    return Promise.reject(error);
  }
);

export const api = {
  get: <T, P = any>(url: string, params?: P) => {
    return axiosInstance.get<T>(url, {
      ...params,
    });
  },
  post: <T, P = any>(url: string, data: P) => {
    return axiosInstance.post<T>(url, data);
  },
  patch: <T, P = any>(url: string, data: any) =>
    axiosInstance.patch<T>(url, data),
  delete: <T>(url: string) => axiosInstance.delete<T>(url),
};
