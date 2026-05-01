import React, { useEffect, useMemo, useState, useCallback } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import {
  addRoom,
  getRooms,
  getRoomSummary,
  deleteRoom,
} from "../../services/room/roomService";

const STATUS_FILTERS = ["All", "Available", "Occupied", "Partially Occupied"];

export default function RoomListScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [rooms, setRooms] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [showAdd, setShowAdd] = useState(false);
  const [roomNumber, setRoomNumber] = useState("");
  const [floor, setFloor] = useState("");
  const [capacity, setCapacity] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [roomsData, summaryData] = await Promise.all([
        getRooms(),
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

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const filteredRooms = useMemo(() => {
    const s = search.trim().toLowerCase();
    return rooms.filter((r) => {
      const matchesSearch =
        !s ||
        String(r.roomNumber).toLowerCase().includes(s) ||
        String(r.floor).toLowerCase().includes(s);

      const matchesFilter = filter === "All" ? true : r.status === filter;

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

      Alert.alert("Success", "Room added successfully");

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

  const handleDeleteRoom = (roomId, roomNumber) => {
    Alert.alert(
      "Delete Room",
      `Are you sure you want to delete Room ${roomNumber}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRoom(roomId);
              Alert.alert("Deleted", "Room deleted successfully");
              await load();
            } catch (e) {
              const msg = e?.response?.data?.message || "Failed to delete room.";
              Alert.alert("Error", msg);
            }
          },
        },
      ]
    );
  };

  // ── SUMMARY CARD ────────────────────────────────────────────────────────────
  const SummaryCard = ({ label, value, icon, type }) => {
    const config = {
      total: { border: "#CFE5DF" },
      occupied: { border: "#E57373" },
      available: { border: "#2F6F5E" },
    };
    const c = config[type] || { border: "#CFE5DF" };

    return (
      <View style={[styles.summaryCard, { borderLeftColor: c.border }]}>
        <View style={styles.summaryInner}>
          <View style={styles.summaryIconBox}>{icon}</View>
          <Text style={styles.summaryValue}>{value ?? "-"}</Text>
        </View>
        <Text style={styles.summaryLabel}>{label}</Text>
      </View>
    );
  };

  // ── STATUS PILL ──────────────────────────────────────────────────────────────
  const StatusPill = ({ status }) => {
    const config = {
      Available: { bg: "#E7F6ED", fg: "#1C7C3A" },
      Occupied: { bg: "#FDECEC", fg: "#B42318" },
      "Partially Occupied": { bg: "#FFF5D9", fg: "#9A6B00" },
    };
    const { bg, fg } = config[status] || { bg: "#F0F0F0", fg: "#666" };
    return (
      <View style={[styles.pill, { backgroundColor: bg }]}>
        <Text style={[styles.pillText, { color: fg }]}>{status}</Text>
      </View>
    );
  };

  // ✅ UPDATED: Now correctly uses fullName from your Student schema
  const getStudentName = (s) => {
    if (!s) return "";
    return (
      s.fullName ||
      `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() ||
      s.name ||
      `Student ${s._id?.slice(-4) || ""}`
    );
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name[0].toUpperCase();
  };

  // ── ROOM CARD ────────────────────────────────────────────────────────────────
  const RoomCard = ({ item }) => {
    // Filter out deleted students (defensive)
    const assignedStudents = (item.assignedStudents ?? []).filter(
      (s) => s && !s.isDeleted
    );
    const assignedCount = assignedStudents.length;

    return (
      <View style={styles.roomCard}>
        <View style={styles.roomHeaderRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1, flexWrap: "wrap" }}>
            <Text style={styles.roomTitle}>Room {item.roomNumber}</Text>
            <StatusPill status={item.status} />
          </View>
          <View style={styles.iconRow}>
            <Pressable
              style={styles.actionIcon}
              onPress={() => navigation.navigate("EditRoom", { roomId: item._id })}
            >
              <Ionicons name="pencil-outline" size={16} color="#2F6F5E" />
            </Pressable>
            <Pressable
              style={styles.actionIcon}
              onPress={() => handleDeleteRoom(item._id, item.roomNumber)}
            >
              <Ionicons name="trash-outline" size={16} color="#2F6F5E" />
            </Pressable>
          </View>
        </View>

        <Text style={styles.roomSub}>
          Floor {item.floor}{"   "}Capacity {assignedCount}/{item.capacity}
        </Text>

        {assignedStudents.length > 0 && (
          <View style={styles.studentTagRow}>
            {assignedStudents.map((s) => {
              const name = getStudentName(s);
              return (
                <View key={s._id} style={styles.studentTag}>
                  <Text style={styles.studentTagText}>{name}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  // ── LIST HEADER ─────────────────────────────────────────────────────────────
  const ListHeader = useMemo(() => (
    <>
      <Text style={styles.screenTitle}>Room & Occupancy</Text>

      <View style={styles.summaryRow}>
        <SummaryCard
          label="Total"
          value={summary?.totalRooms}
          type="total"
          icon={<MaterialCommunityIcons name="door-open" size={18} color="#555" />}
        />
        <SummaryCard
          label="Occupied"
          value={summary?.occupiedRooms}
          type="occupied"
          icon={<MaterialCommunityIcons name="door-closed" size={18} color="#B42318" />}
        />
        <SummaryCard
          label="Available"
          value={summary?.availableRooms}
          type="available"
          icon={<MaterialCommunityIcons name="bed" size={18} color="#2F6F5E" />}
        />
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={16} color="#aaa" style={{ marginRight: 6 }} />
        <TextInput
          placeholder="Search by room number..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginVertical: 12, flexGrow: 0 }}
        contentContainerStyle={styles.filterRow}
      >
        {STATUS_FILTERS.map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </>
  ), [summary, search, filter]);

  return (
    <LinearGradient
      colors={["#E9F4F0", "#D4EDE6"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradientContainer}
    >
      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={ListHeader}
        ListHeaderComponentStyle={{ paddingTop: insets.top + 8 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 100,
        }}
        renderItem={({ item }) => <RoomCard item={item} />}
        refreshing={loading}
        onRefresh={load}
        ListEmptyComponent={
          loading ? null : (
            <Text style={{ marginTop: 40, textAlign: "center", color: "#888", fontSize: 16 }}>
              No rooms found.
            </Text>
          )
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      <Pressable
        style={[styles.fab, { bottom: insets.bottom + 20 }]}
        onPress={() => setShowAdd(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      <Modal visible={showAdd} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowAdd(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add New Room</Text>

            <Text style={styles.inputLabel}>Room Number</Text>
            <TextInput
              style={styles.input}
              value={roomNumber}
              onChangeText={setRoomNumber}
              placeholder=""
            />

            <Text style={styles.inputLabel}>Floor</Text>
            <TextInput
              style={styles.input}
              value={floor}
              onChangeText={setFloor}
              keyboardType="numeric"
              placeholder=""
            />

            <Text style={styles.inputLabel}>Capacity</Text>
            <TextInput
              style={styles.input}
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="numeric"
              placeholder=""
            />

            <Pressable style={styles.primaryBtn} onPress={handleAddRoom} disabled={saving}>
              <Text style={styles.primaryBtnText}>
                {saving ? "Adding..." : "Add Room"}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: { flex: 1 },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  summaryInner: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  summaryIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#F4F6F5",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryValue: { fontSize: 20, fontWeight: "800", color: "#111" },
  summaryLabel: { fontSize: 12, color: "#666" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#333" },
  filterRow: { flexDirection: "row", gap: 8, paddingRight: 4 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#fff",
    borderRadius: 20,
  },
  filterChipActive: { backgroundColor: "#2F6F5E" },
  filterText: { fontSize: 13, color: "#444" },
  filterTextActive: { color: "#fff", fontWeight: "600" },
  roomCard: {
    backgroundColor: "#fff",
    padding: 14,
    marginBottom: 10,
    borderRadius: 14,
  },
  roomHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  roomTitle: { fontWeight: "700", fontSize: 15, color: "#111" },
  roomSub: { fontSize: 12, color: "#666", marginBottom: 8 },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  pillText: { fontSize: 11, fontWeight: "600" },
  iconRow: { flexDirection: "row", gap: 8 },
  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: "#EAF3F0",
    alignItems: "center",
    justifyContent: "center",
  },
  studentTagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  studentTag: {
    backgroundColor: "#EAF3F0",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  studentTagText: { fontSize: 12, color: "#2F6F5E", fontWeight: "500" },
  studentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#B2D8CE",
    alignItems: "center",
    justifyContent: "center",
  },
  studentAvatarText: { fontSize: 11, fontWeight: "700", color: "#2F6F5E" },
  fab: {
    position: "absolute",
    right: 16,
    backgroundColor: "#2F6F5E",
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  modalOverlay: { flex: 1, backgroundColor: "#00000055", justifyContent: "center" },
  modalCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#111", marginBottom: 18 },
  inputLabel: { fontSize: 13, color: "#444", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#111",
    marginBottom: 14,
  },
  primaryBtn: {
    backgroundColor: "#2F6F5E",
    padding: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  primaryBtnText: { color: "#fff", textAlign: "center", fontWeight: "700", fontSize: 15 },
  screenTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
});