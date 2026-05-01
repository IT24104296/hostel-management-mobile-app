<<<<<<< HEAD
//const API_URL = "http://192.168.1.18:5000";
//export default API_URL;

const API_URL = "http://10.0.2.2:5000";
export default API_URL;

//const API_URL = "http://172.28.1.110:5000";
//export default API_URL;
=======
import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.1.19:5000",
  headers: { "Content-Type": "application/json" },
});

export default API;
>>>>>>> origin/develop
