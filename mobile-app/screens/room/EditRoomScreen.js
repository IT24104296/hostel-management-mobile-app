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
} from "react-native";
import {
  getRoomById,
  updateRoom,
  assignStudent,
  removeStudent,
} from "../../services/room/roomService";

export default function EditRoomScreen({ route, navigation }) {
  const { roomId } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [room, setRoom] = useState(null);

  const [roomNumber, setRoomNumber] = useState("");
  const [floor, setFloor] = useState("");
  const [capacity, setCapacity] = useState("");

  const [showAssign, setShowAssign] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [assigning, setAssigning] = useState(false);

  const STUDENTS = useMemo(
    () => [
      "Amaya Silva",
      "Sana Sheikh",
      "Nethmi Perera",
      "Tharushi Bandara",
      "Dilini Rathnayaka",
      "Saranya Peris",
      "Mihiri Perera",
      "Fathima Nila",
      "Ayesha Rahman",
      "Hiruni Jayasinghe",
    ],
    []
  );

  const loadRoom = async () => {
    try {
      setLoading(true);

      const data = await getRoomById(roomId);

      setRoom(data);
      setRoomNumber(String(data.roomNumber ?? ""));
      setFloor(String(data.floor ?? ""));
      setCapacity(String(data.capacity ?? ""));

      navigation.setOptions({
        title: `Edit Room - ${data.roomNumber}`,
      });
    } catch (e) {
      console.log(e?.message);
      Alert.alert("Error", "Failed to load room details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoom();
  }, [roomId]);

  const statusPillStyle = useMemo(() => {
    const s = room?.status;
    if (s === "Available") return { bg: "#E7F6ED", fg: "#1C7C3A" };
    if (s === "Occupied") return { bg: "#FDECEC", fg: "#B42318" };
    return { bg: "#FFF5D9", fg: "#9A6B00" };
  }, [room?.status]);

  const assignedCount = room?.assignedStudents?.length ?? 0;
  const cap = room?.capacity ?? 0;

  const availableCandidates = useMemo(() => {
    const assigned = new Set(
      (room?.assignedStudents ?? []).map((x) => x.toLowerCase())
    );
    return STUDENTS.filter((name) => !assigned.has(name.toLowerCase()));
  }, [room?.assignedStudents, STUDENTS]);

  const filteredCandidates = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    return availableCandidates.filter((name) =>
      name.toLowerCase().includes(q)
    );
  }, [availableCandidates, studentSearch]);

  const handleSave = async () => {
    const rn = roomNumber.trim();
    const fl = Number(floor);
    const capNum = Number(capacity);

    if (!rn || Number.isNaN(fl) || Number.isNaN(capNum) || capNum < 1) {
      Alert.alert(
        "Invalid",
        "Please enter valid Room Number, Floor and Capacity."
      );
      return;
    }

    if (capNum < assignedCount) {
      Alert.alert(
        "Capacity too low",
        `This room already has ${assignedCount} assigned students. Increase capacity or remove students first.`
      );
      return;
    }

    try {
      setSaving(true);
      const updated = await updateRoom(roomId, {
        roomNumber: rn,
        floor: fl,
        capacity: capNum,
      });
      setRoom(updated);
      Alert.alert("Saved", "Room details updated.");
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to save.";
      Alert.alert("Error", msg);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (name) => {
    Alert.alert("Remove student", `Remove ${name} from this room?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            const updated = await removeStudent(roomId, name);
            setRoom(updated);
          } catch (e) {
            const msg =
              e?.response?.data?.message || "Failed to remove student.";
            Alert.alert("Error", msg);
          }
        },
      },
    ]);
  };

  const handleOpenAssign = () => {
    if ((room?.assignedStudents?.length ?? 0) >= (room?.capacity ?? 0)) {
      Alert.alert(
        "Room full",
        "This room is fully occupied. Remove a student to assign a new one."
      );
      return;
    }
    setStudentSearch("");
    setSelectedStudent(null);
    setShowAssign(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedStudent) {
      Alert.alert("Select a student", "Please select a student to assign.");
      return;
    }

    try {
      setAssigning(true);
      const updated = await assignStudent(roomId, selectedStudent);
      setRoom(updated);
      setShowAssign(false);
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to assign student.";
      Alert.alert("Error", msg);
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading room...</Text>
      </View>
    );
  }

  if (!room) {
    return (
      <View style={styles.center}>
        <Text>Room not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.headerTitle}>Edit Room - Room {room.roomNumber}</Text>
        <Pressable
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>
            {saving ? "Saving..." : "Save"}
          </Text>
        </Pressable>
      </View>

      <View
        style={[styles.statusPill, { backgroundColor: statusPillStyle.bg }]}
      >
        <Text style={[styles.statusText, { color: statusPillStyle.fg }]}>
          Status: {room.status}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Room Details</Text>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Room Number</Text>
            <TextInput
              style={styles.input}
              value={roomNumber}
              onChangeText={setRoomNumber}
            />
          </View>

          <View style={{ width: 12 }} />

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Floor</Text>
            <TextInput
              style={styles.input}
              value={floor}
              onChangeText={setFloor}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={styles.label}>Capacity</Text>
        <TextInput
          style={styles.input}
          value={capacity}
          onChangeText={setCapacity}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Assigned Students ({assignedCount}/{cap})
        </Text>

        {assignedCount === 0 ? (
          <Text style={{ color: "#95A6A0", marginTop: 6 }}>
            No students assigned.
          </Text>
        ) : (
          <View style={{ marginTop: 10, gap: 8 }}>
            {room.assignedStudents.map((name) => (
              <View key={name} style={styles.studentRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {name.trim().charAt(0).toUpperCase()}
                  </Text>
                </View>

                <Text style={{ flex: 1, fontWeight: "700" }}>{name}</Text>

                <Pressable
                  style={styles.removeBtn}
                  onPress={() => handleRemove(name)}
                >
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

      <Modal
        visible={showAssign}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAssign(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Assigned Student to Room {room.roomNumber}
            </Text>

            <View style={styles.searchBox}>
              <TextInput
                placeholder="Search"
                value={studentSearch}
                onChangeText={setStudentSearch}
                style={styles.searchInput}
              />
            </View>

            <FlatList
              data={filteredCandidates}
              keyExtractor={(item) => item}
              style={{ marginTop: 10 }}
              renderItem={({ item }) => {
                const selected = selectedStudent === item;

                return (
                  <Pressable
                    style={[
                      styles.candidateRow,
                      selected && styles.candidateRowSelected,
                    ]}
                    onPress={() => setSelectedStudent(item)}
                  >
                    <View style={styles.avatarSmall}>
                      <Text style={styles.avatarTextSmall}>
                        {item.charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    <Text style={{ flex: 1, fontWeight: "700" }}>{item}</Text>

                    <View
                      style={[
                        styles.selectPill,
                        selected && styles.selectPillSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.selectPillText,
                          selected && styles.selectPillTextSelected,
                        ]}
                      >
                        {selected ? "Selected" : "Select"}
                      </Text>
                    </View>
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <Text style={{ marginTop: 10 }}>No students found.</Text>
              }
            />

            <Pressable
              style={styles.confirmBtn}
              onPress={handleConfirmAssign}
              disabled={assigning}
            >
              <Text style={styles.confirmBtnText}>
                {assigning ? "Confirming..." : "Confirm"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowAssign(false)}
              style={{ marginTop: 10 }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "#2F6F5E",
                  fontWeight: "800",
                }}
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
    backgroundColor: "#E9F4F0",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    flex: 1,
  },

  saveBtn: {
    backgroundColor: "#2F6F5E",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "900",
  },

  statusPill: {
    marginTop: 10,
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontWeight: "900",
    fontSize: 12,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "900",
  },

  row: {
    flexDirection: "row",
    marginTop: 10,
  },
  label: {
    marginTop: 10,
    fontSize: 12,
    color: "#5A6B66",
    fontWeight: "800",
  },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#DDE6E2",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },

  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#EAF3F0",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontWeight: "900",
    color: "#2F6F5E",
  },

  removeBtn: {
    backgroundColor: "#FDECEC",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  removeBtnText: {
    color: "#B42318",
    fontWeight: "900",
    fontSize: 12,
  },

  assignBtn: {
    marginTop: 12,
    backgroundColor: "#2F6F5E",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  assignBtnText: {
    color: "#fff",
    fontWeight: "900",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 14,
    maxHeight: "85%",
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: "900",
  },

  searchBox: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#DDE6E2",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    fontSize: 14,
  },

  candidateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  candidateRowSelected: {
    backgroundColor: "#F2FBF8",
    borderRadius: 12,
    paddingHorizontal: 8,
  },

  avatarSmall: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: "#EAF3F0",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTextSmall: {
    fontWeight: "900",
    color: "#2F6F5E",
  },

  selectPill: {
    borderWidth: 1,
    borderColor: "#CFE1DB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  selectPillSelected: {
    backgroundColor: "#2F6F5E",
    borderColor: "#2F6F5E",
  },
  selectPillText: {
    fontWeight: "900",
    fontSize: 12,
    color: "#2A3A36",
  },
  selectPillTextSelected: {
    color: "#fff",
  },

  confirmBtn: {
    marginTop: 12,
    backgroundColor: "#2F6F5E",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmBtnText: {
    color: "#fff",
    fontWeight: "900",
  },
});