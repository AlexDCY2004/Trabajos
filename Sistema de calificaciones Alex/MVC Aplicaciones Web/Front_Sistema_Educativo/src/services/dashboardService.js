import apiClient from "./apiClient";

export const obtenerResumenDashboard = async () => {
  const response = await apiClient.get("/api/dashboard/resumen");
  return response.data;
};