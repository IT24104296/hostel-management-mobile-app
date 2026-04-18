import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { navigationRef } from '../App';


export const API_BASE_URL = "http://192.168.1.4:5000";


const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});


api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,                    
  async (error) => {
    const originalRequest = error.config;

    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

     
      await AsyncStorage.removeItem("token");

      
      if (navigationRef.isReady()) {
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    }

    return Promise.reject(error);
  }
);

export default api;