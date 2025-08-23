import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    if (config.headers) {
      // Если Axios v1+ — используем .set()
      if (typeof (config.headers as any).set === "function") {
        (config.headers as any).set("Authorization", `Bearer ${token}`);
      } else {
        // Для совместимости со старым Axios
        (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
      }
    }
  }
  return config;
});

export default api;
