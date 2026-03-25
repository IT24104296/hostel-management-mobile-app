import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { addRoom, getRooms, getRoomSummary } from "../../services/room/roomService";

const STATUS_FILTERS = ["All", "Available", "Occupied", "Partially Occupied"];

export default function RoomListScreen({ navigation }) {
  const [rooms, setRooms] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // Add Room modal
  const [showAdd, setShowAdd] = useState(false);
  const [roomNumber, setRoomNumber] = useState("");
  const [floor, setFloor] = useState("");
  const [capacity, setCapacity] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [roomsData, summaryData] = await Promise.all([
        getRooms(), // load all then filter locally
        getRoomSummary(),
      ]);
      setRooms(roomsData);
      setSummary(summaryData);
    } catch (e) {
      console.log(e?.message);
      Alert.alert("Error", "Failed to load rooms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredRooms = useMemo(() => {
    const s = search.trim().toLowerCase();
    return rooms.filter((r) => {
      const matchesSearch =
        !s ||
        String(r.roomNumber).toLowerCase().includes(s) ||
        String(r.floor).toLowerCase().includes(s);

      const matchesFilter =
        filter === "All" ? true : r.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [rooms, search, filter]);

  const handleAddRoom = async () => {
    const rn = roomNumber.trim();
    if (!rn || !floor.trim() || !capacity.trim()) {
      Alert.alert("Missing info", "Please fill Room Number, Floor and Capacity.");
      return;
    }
    const floorNum = Number(floor);
    const capNum = Number(capacity);
    if (Number.isNaN(floorNum) || Number.isNaN(capNum) || capNum < 1) {
      Alert.alert("Invalid", "Floor and Capacity must be valid numbers.");
      return;
    }

    try {
      setSaving(true);
      await addRoom({ roomNumber: rn, floor: floorNum, capacity: capNum });
      setShowAdd(false);
      setRoomNumber("");
      setFloor("");
      setCapacity("");
      await load();
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to add room.";
      Alert.alert("Error", msg);
    } finally {
      setSaving(false);
    }
  };

  const SummaryCard = ({ label, value }) => (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryValue}>{value ?? "-"}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );

  const StatusPill = ({ status }) => {
    const bg =
      status === "Available"
        ? "#E7F6ED"
        : status === "Occupied"
        ? "#FDECEC"
        : "#FFF5D9";
    const fg =
      status === "Available"
        ? "#1C7C3A"
        : status === "Occupied"
        ? "#B42318"
        : "#9A6B00";

    return (
      <View style={[styles.pill, { backgroundColor: bg }]}>
        <Text style={[styles.pillText, { color: fg }]}>{status}</Text>
      </View>
    );
  };

  const RoomCard = ({ item }) => (
  <Pressable
    style={styles.roomCard}
    onPress={() => navigation.navigate("EditRoom", { roomId: item._id })}
  >
    <View style={{ flex: 1 }}>
      <Text style={styles.roomTitle}>Room {item.roomNumber}</Text>
      <Text>Floor {item.floor}</Text>
      <Text>
        Capacity {item.assignedStudents.length}/{item.capacity}
      </Text>
      <Text>Status: {item.status}</Text>
    </View>
  </Pressable>
);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Summary cards row */}
      <View style={styles.summaryRow}>
        <SummaryCard label="Total" value={summary?.totalRooms} />
        <SummaryCard label="Occupied" value={summary?.occupiedRooms} />
        <SummaryCard label="Available" value={summary?.availableRooms} />
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <TextInput
          placeholder="Search by room number..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === "Partially Occupied" ? "Partially Occupied" : f}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Rooms list */}
      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 90 }}
        renderItem={({ item }) => <RoomCard item={item} />}
        refreshing={loading}
        onRefresh={load}
        ListEmptyComponent={<Text style={{ marginTop: 20 }}>No rooms found.</Text>}
      />

      {/* Floating + button */}
      <Pressable style={styles.fab} onPress={() => setShowAdd(true)}>
        <Text style={styles.fabText}>＋</Text>
      </Pressable>

      {/* Add Room Modal */}
      <Modal visible={showAdd} transparent animationType="fade" onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Room</Text>
              <Pressable onPress={() => setShowAdd(false)}>
                <Text style={{ fontSize: 18, fontWeight: "800" }}>✕</Text>
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Room Number</Text>
            <TextInput style={styles.input} value={roomNumber} onChangeText={setRoomNumber} />

            <Text style={styles.inputLabel}>Floor</Text>
            <TextInput style={styles.input} value={floor} onChangeText={setFloor} keyboardType="numeric" />

            <Text style={styles.inputLabel}>Capacity</Text>
            <TextInput style={styles.input} value={capacity} onChangeText={setCapacity} keyboardType="numeric" />

            <Pressable style={styles.primaryBtn} onPress={handleAddRoom} disabled={saving}>
              <Text style={styles.primaryBtnText}>{saving ? "Adding..." : "Add Room"}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14, backgroundColor: "#E9F4F0" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  summaryCard: { flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 12, alignItems: "center" },
  summaryValue: { fontSize: 18, fontWeight: "800" },
  summaryLabel: { marginTop: 4, fontSize: 12, color: "#5A6B66" },

  searchBox: { backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { fontSize: 14 },

  filterRow: { flexDirection: "row", gap: 8, marginTop: 10, marginBottom: 10, flexWrap: "wrap" },
  filterChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "#fff" },
  filterChipActive: { backgroundColor: "#2F6F5E" },
  filterText: { fontSize: 12, color: "#2A3A36", fontWeight: "700" },
  filterTextActive: { color: "#fff" },

  roomCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  roomHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  roomTitle: { fontSize: 16, fontWeight: "800" },
  roomSub: { marginTop: 4, color: "#5A6B66", fontSize: 12 },
  roomStudents: { marginTop: 8, fontSize: 12, color: "#2A3A36" },
  roomStudentsEmpty: { marginTop: 8, fontSize: 12, color: "#95A6A0" },

  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  pillText: { fontSize: 11, fontWeight: "800" },

  editIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#EAF3F0",
    alignItems: "center",
    justifyContent: "center",
  },

  fab: {
    position: "absolute",
    right: 16,
    bottom: 18,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#2F6F5E",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  fabText: { color: "#fff", fontSize: 28, fontWeight: "800", marginTop: -2 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
  modalCard: { width: "88%", backgroundColor: "#fff", borderRadius: 16, padding: 14 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  modalTitle: { fontSize: 16, fontWeight: "800" },

  inputLabel: { marginTop: 10, fontSize: 12, color: "#5A6B66", fontWeight: "700" },
  input: { marginTop: 6, borderWidth: 1, borderColor: "#DDE6E2", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },

  primaryBtn: { marginTop: 14, backgroundColor: "#2F6F5E", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "800" },
});