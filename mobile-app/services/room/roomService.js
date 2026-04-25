import api from "../api";

export const getRooms = async (status) => {
  const res = await api.get("/api/rooms", { params: status ? { status } : {} });
  return res.data;
};

export const getRoomById = async (id) =>
  (await api.get(`/api/rooms/${id}`)).data;

export const addRoom = async (data) =>
  (await api.post("/api/rooms", data)).data;

export const updateRoom = async (id, data) =>
  (await api.put(`/api/rooms/${id}`, data)).data;

export const deleteRoom = async (id) =>
  (await api.delete(`/api/rooms/${id}`)).data;

export const assignStudent = async (roomId, studentId) => {
  const { data } = await api.post("/api/rooms/assign-student", {
    roomId,
    studentId,
  });
  return data;
};

export const removeStudent = async (roomId, studentId) => {
  const { data } = await api.post("/api/rooms/remove-student", {
    roomId,
    studentId,
  });
  return data;
};

export const getRoomSummary = async () =>
  (await api.get("/api/rooms/summary")).data;