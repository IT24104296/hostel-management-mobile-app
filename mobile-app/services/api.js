import axios from "axios";

const API = axios.create({
  baseURL: "http://10.0.2.2:5000",
  headers: { "Content-Type": "application/json" },
});

export default API;