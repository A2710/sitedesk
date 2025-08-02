import axios from 'axios';

const apiClient = axios.create({
  // baseURL: import.meta.env.VITE_API_URL,
  baseURL:"http://localhost:5001/api/widget",
  withCredentials: true,
});
export default apiClient;