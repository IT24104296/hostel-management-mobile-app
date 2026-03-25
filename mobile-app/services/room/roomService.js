import API from "../api";

export const getRooms = async (status) => {
  const res = await API.get("/api/rooms", { params: status ? { status } : {} });
  return res.data;
};

export const getRoomById = async (id) =>
  (await API.get(`/api/rooms/${id}`)).data;

export const addRoom = async (data) =>
  (await API.post("/api/rooms", data)).data;

export const updateRoom = async (id, data) =>
  (await API.put(`/api/rooms/${id}`, data)).data;

export const deleteRoom = async (id) =>
  (await API.delete(`/api/rooms/${id}`)).data;

export const assignStudent = async (roomId, studentId) =>
  (await API.post(`/api/rooms/${roomId}/assign`, { studentId })).data;

export const removeStudent = async (roomId, studentId) =>
  (await API.post(`/api/rooms/${roomId}/remove`, { studentId })).data;

export const getRoomSummary = async () =>
  (await API.get("/api/rooms/summary")).data;