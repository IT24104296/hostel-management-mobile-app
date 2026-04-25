import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import {
  getRoomById,
  updateRoom,
  assignStudent,
  removeStudent,
} from "../../services/room/roomService";

import api from "../../services/api";

export default function EditRoomScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { roomId } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [room, setRoom] = useState(null);
  const [allStudents, setAllStudents] = useState([]);

  const [roomNumber, setRoomNumber] = useState("");
  const [floor, setFloor] = useState("");
  const [capacity, setCapacity] = useState("");

  const [showAssign, setShowAssign] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [assigning, setAssigning] = useState(false);

  // Load room + all students
  const loadData = async () => {
    try {
      setLoading(true);
      const [roomResponse, studentsResponse] = await Promise.all([
        api.get(`/api/rooms/${roomId}`),
        api.get("/api/students"),
      ]);

      const roomData = roomResponse.data;
      const studentsData = studentsResponse.data;

      setRoom(roomData);
      setAllStudents(studentsData || []);

      setRoomNumber(String(roomData.roomNumber ?? ""));
      setFloor(String(roomData.floor ?? ""));
      setCapacity(String(roomData.capacity ?? ""));

      navigation.setOptions({ title: `Edit Room - ${roomData.roomNumber}` });
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [roomId]);

  const getStudentName = (student) => {
    if (!student) return "Unknown Student";
    return (
      student.fullName ||
      student.name ||
      `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
      `Student ${student._id?.slice(-4) || ""}`
    );
  };

  const assignedCount = room?.assignedStudents?.length ?? 0;
  const cap = room?.capacity ?? 0;

  // Only show students who are completely free
  const availableCandidates = useMemo(() => {
    const assignedToThisRoom = new Set(
      (room?.assignedStudents ?? []).map((s) => s?._id || s)
    );

    return allStudents.filter((student) => {
      if (assignedToThisRoom.has(student._id)) return false;
      if (student.room) return false;           // already in another room
      if (student.isDeleted) return false;
      return true;
    });
  }, [allStudents, room?.assignedStudents]);

  const filteredCandidates = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    return availableCandidates.filter((s) =>
      getStudentName(s).toLowerCase().includes(q)
    );
  }, [availableCandidates, studentSearch]);

  const handleSave = async () => {
    const rn = roomNumber.trim();
    const fl = Number(floor);
    const capNum = Number(capacity);

    if (!rn || Number.isNaN(fl) || Number.isNaN(capNum) || capNum < 1) {
      Alert.alert("Invalid", "Please enter valid Room Number, Floor and Capacity.");
      return;
    }

    try {
      setSaving(true);
      await updateRoom(roomId, { roomNumber: rn, floor: fl, capacity: capNum });
      await loadData();                    // ← Re-fetch full populated room
      Alert.alert("Saved", "Room details updated.");
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAssign = () => {
    if ((room?.assignedStudents?.length ?? 0) >= (room?.capacity ?? 0)) {
      Alert.alert("Room full", "This room is already at full capacity.");
      return;
    }
    setStudentSearch("");
    setSelectedStudent(null);
    setShowAssign(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedStudent) return Alert.alert("Select a student");

    try {
      setAssigning(true);
      await assignStudent(roomId, selectedStudent._id);
      await loadData();                    // ← Re-fetch full populated room
      setShowAssign(false);
      setSelectedStudent(null);
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to assign student.");
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveStudent = async (student) => {
    Alert.alert("Remove student", `Remove ${getStudentName(student)}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await removeStudent(roomId, student._id);
            await loadData();               // ← Re-fetch full populated room
          } catch (e) {
            Alert.alert("Error", e?.response?.data?.message || "Failed to remove student.");
          }
        },
      },
    ]);
  };

  return (
    <LinearGradient colors={["#E9F4F0", "#D4EDE6"]} style={styles.gradientContainer}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#2F6F5E" />
            <Text style={{ marginTop: 12, color: "#555" }}>Loading room...</Text>
          </View>
        ) : !room ? (
          <View style={styles.center}>
            <Text style={{ color: "#666", fontSize: 16 }}>Room not found.</Text>
          </View>
        ) : (
          <>
            <View style={styles.topRow}>
              <Text style={styles.headerTitle}>Edit Room - Room {room.roomNumber}</Text>
              <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                <Text style={styles.saveBtnText}>{saving ? "Saving..." : "Save"}</Text>
              </Pressable>
            </View>

            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor:
                    room.status === "Available"
                      ? "#E7F6ED"
                      : room.status === "Occupied"
                      ? "#FDECEC"
                      : "#FFF5D9",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      room.status === "Available"
                        ? "#1C7C3A"
                        : room.status === "Occupied"
                        ? "#B42318"
                        : "#9A6B00",
                  },
                ]}
              >
                Status: {room.status}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Room Details</Text>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Room Number</Text>
                  <TextInput style={styles.input} value={roomNumber} onChangeText={setRoomNumber} />
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Floor</Text>
                  <TextInput style={styles.input} value={floor} onChangeText={setFloor} keyboardType="numeric" />
                </View>
              </View>
              <Text style={styles.label}>Capacity</Text>
              <TextInput style={styles.input} value={capacity} onChangeText={setCapacity} keyboardType="numeric" />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Assigned Students ({assignedCount}/{cap})
              </Text>

              {assignedCount === 0 ? (
                <Text style={{ color: "#95A6A0", marginTop: 6 }}>No students assigned.</Text>
              ) : (
                <View style={{ marginTop: 10, gap: 8 }}>
                  {room.assignedStudents
                    .filter((student) => student && !student.isDeleted)
                    .map((student) => (
                      <View key={student._id} style={styles.studentRow}>
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>
                            {getStudentName(student)[0].toUpperCase()}
                          </Text>
                        </View>
                        <Text style={{ flex: 1, fontWeight: "700" }}>{getStudentName(student)}</Text>
                        <Pressable style={styles.removeBtn} onPress={() => handleRemoveStudent(student)}>
                          <Text style={styles.removeBtnText}>Remove</Text>
                        </Pressable>
                      </View>
                    ))}
                </View>
              )}

              <Pressable style={styles.assignBtn} onPress={handleOpenAssign}>
                <Text style={styles.assignBtnText}>Assign Student</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>

      {/* Modal */}
      <Modal visible={showAssign} transparent animationType="slide" onRequestClose={() => setShowAssign(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Assign Student to Room {room?.roomNumber}</Text>

            <View style={styles.searchBox}>
              <TextInput
                placeholder="Search students..."
                value={studentSearch}
                onChangeText={setStudentSearch}
                style={styles.searchInput}
              />
            </View>

            <FlatList
              data={filteredCandidates}
              keyExtractor={(item) => item._id}
              style={{ marginTop: 10, maxHeight: 420 }}
              renderItem={({ item }) => {
                const selected = selectedStudent?._id === item._id;
                return (
                  <Pressable
                    key={item._id}   // ← extra safety
                    style={[styles.candidateRow, selected && styles.candidateRowSelected]}
                    onPress={() => setSelectedStudent(item)}
                  >
                    <View style={styles.avatarSmall}>
                      <Text style={styles.avatarTextSmall}>{getStudentName(item)[0].toUpperCase()}</Text>
                    </View>
                    <Text style={{ flex: 1, fontWeight: "700" }}>{getStudentName(item)}</Text>
                    <View style={[styles.selectPill, selected && styles.selectPillSelected]}>
                      <Text style={[styles.selectPillText, selected && styles.selectPillTextSelected]}>
                        {selected ? "Selected" : "Select"}
                      </Text>
                    </View>
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <Text style={{ marginTop: 20, textAlign: "center", color: "#666" }}>No students found.</Text>
              }
            />

            <Pressable style={styles.confirmBtn} onPress={handleConfirmAssign} disabled={assigning}>
              <Text style={styles.confirmBtnText}>
                {assigning ? "Assigning..." : "Confirm Assignment"}
              </Text>
            </Pressable>

            <Pressable onPress={() => setShowAssign(false)} style={{ marginTop: 12 }}>
              <Text style={{ textAlign: "center", color: "#2F6F5E", fontWeight: "800" }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: { flex: 1 },
  scrollView: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 300 },

  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111", flex: 1 },

  saveBtn: { backgroundColor: "#2F6F5E", paddingHorizontal: 18, paddingVertical: 9, borderRadius: 10 },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  statusPill: { marginTop: 14, alignSelf: "center", paddingHorizontal: 18, paddingVertical: 7, borderRadius: 999 },
  statusText: { fontWeight: "700", fontSize: 13 },

  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginTop: 16 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#111", marginBottom: 8 },

  row: { flexDirection: "row", marginTop: 8 },
  label: { marginTop: 14, fontSize: 13, color: "#5A6B66", fontWeight: "700" },
  input: { marginTop: 6, borderWidth: 1, borderColor: "#DDE6E2", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },

  studentRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  avatar: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#EAF3F0", alignItems: "center", justifyContent: "center" },
  avatarText: { fontWeight: "700", color: "#2F6F5E", fontSize: 16 },

  removeBtn: { backgroundColor: "#FDECEC", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999 },
  removeBtnText: { color: "#B42318", fontWeight: "700", fontSize: 13 },

  assignBtn: { marginTop: 16, backgroundColor: "#2F6F5E", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  assignBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "flex-end" },
  modalCard: { width: "100%", backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "88%" },
  modalTitle: { fontSize: 17, fontWeight: "700", color: "#111", marginBottom: 12 },

  searchBox: { borderWidth: 1, borderColor: "#DDE6E2", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  searchInput: { fontSize: 15 },

  candidateRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 12 },
  candidateRowSelected: { backgroundColor: "#F2FBF8" },

  avatarSmall: { width: 32, height: 32, borderRadius: 999, backgroundColor: "#EAF3F0", alignItems: "center", justifyContent: "center" },
  avatarTextSmall: { fontWeight: "700", color: "#2F6F5E", fontSize: 15 },

  selectPill: { borderWidth: 1, borderColor: "#CFE1DB", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  selectPillSelected: { backgroundColor: "#2F6F5E", borderColor: "#2F6F5E" },
  selectPillText: { fontWeight: "700", fontSize: 13, color: "#2A3A36" },
  selectPillTextSelected: { color: "#fff" },

  confirmBtn: { marginTop: 20, backgroundColor: "#2F6F5E", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  confirmBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});