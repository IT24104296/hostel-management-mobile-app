import React, { useCallback, useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";

import api from "../../services/api";

const DARK_GREEN = "#4C8A73";
const BG_TOP = "#F4FBF8";
const BG_BOTTOM = "#BFE5DB";

export default function StudentListScreen({ navigation }) {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const fetchStudents = async () => {
    try {
      const res = await api.get("/api/students");
      const rawStudents = Array.isArray(res.data) ? res.data : res.data.students || [];

      const normalized = rawStudents.map((item, index) => {
        const name =
          item.fullName ||
          item.name ||
          item.studentName ||
          "Unnamed Student";

        const studentId =
          item.studentId ||
          item.studentID ||
          `S${String(index + 1).padStart(3, "0")}`;

        const nic = item.nic || item.NIC || "";

        const statusRaw = (item.status || "Active").toString().toLowerCase();
        const status = statusRaw === "inactive" ? "Inactive" : "Active";

        let roomNumber = "Not Assigned";
        if (item.room?.roomNumber) roomNumber = item.room.roomNumber;
        else if (item.room?.RoomNumber) roomNumber = item.room.RoomNumber;
        else if (typeof item.room === "string") roomNumber = item.room;
        else if (item.roomNumber) roomNumber = item.roomNumber;

        return {
          _id: item._id || studentId,
          fullName: name,
          studentId,
          nic,
          status,
          roomNumber,
        };
      });

      setStudents(normalized);
    } catch (error) {
      console.log("Fetch students error:", error?.response?.data || error.message);
      Alert.alert("Error", "Failed to load students.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchStudents();
    }, [])
  );

  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => s.status === "Active").length;
    const inactive = students.filter((s) => s.status === "Inactive").length;
    return { total, active, inactive };
  }, [students]);

  const filteredStudents = useMemo(() => {
    let result = [...students];

    if (selectedFilter !== "All") {
      result = result.filter((s) => s.status === selectedFilter);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          s.nic.toLowerCase().includes(q)
      );
    }

    return result;
  }, [students, selectedFilter, search]);

 const handleDeletePress = (student) => {
  
  if (selectedFilter === "Inactive") {
    Alert.alert(
      "Permanent Delete",
      `Are you sure you want to permanently delete ${student.fullName}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/api/students/${student._id}`);
              Alert.alert("Success", "Student deleted permanently.");
              fetchStudents();
            } catch (error) {
              console.log(
                "Permanent delete error:",
                error?.response?.data || error.message
              );
              Alert.alert("Error", "Failed to delete student permanently.");
            }
          },
        },
      ]
    );
  } else {
    
    Alert.alert(
      "Mark Inactive",
      `Are you sure you want to mark ${student.fullName} as inactive?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              await api.patch(
                `/api/students/${student._id}/inactive`
              );
              Alert.alert("Success", "Student marked as inactive.");
              fetchStudents();
            } catch (error) {
              console.log(
                "Deactivate error:",
                error?.response?.data || error.message
              );
              Alert.alert("Error", "Failed to mark student as inactive.");
            }
          },
        },
      ]
    );
  }
};

  const StatCard = ({ icon, count, label, accentColor, iconBg, iconColor }) => (
    <View style={[styles.statCard, { borderLeftColor: accentColor }]}>
      <View style={[styles.statIconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View>
        <Text style={styles.statCount}>{count}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );

  const FilterButton = ({ title }) => {
    const active = selectedFilter === title;
    return (
      <TouchableOpacity
        style={[styles.filterBtn, active && styles.filterBtnActive]}
        onPress={() => setSelectedFilter(title)}
        activeOpacity={0.8}
      >
        <Text style={[styles.filterText, active && styles.filterTextActive]}>{title}</Text>
      </TouchableOpacity>
    );
  };

  const renderStudentCard = ({ item }) => {
    const isActive = item.status === "Active";

    return (
      <View style={styles.studentCard}>
        <View style={styles.cardTopRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.nameStatusRow}>
              <Text style={styles.studentName}>{item.fullName}</Text>
              <View
                style={[
                  styles.statusBadge,
                  isActive ? styles.activeBadge : styles.inactiveBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    isActive ? styles.activeText : styles.inactiveText,
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.cardActions}>
  <TouchableOpacity
    style={styles.actionBtn}
    onPress={() => navigation.navigate("StudentProfile", { studentId: item._id })}
  >
    <Ionicons name="eye-outline" size={19} color="#111" />
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.actionBtn}
    onPress={() => navigation.navigate("EditStudent", { studentId: item._id })}
  >
    <Feather name="edit-2" size={17} color="#6AAE9B" />
  </TouchableOpacity>

  {selectedFilter === "Inactive" && (
    <TouchableOpacity
      style={styles.actionBtn}
      onPress={() => handleDeletePress(item)}
    >
      <Ionicons name="trash-outline" size={18} color="#E14B3B" />
    </TouchableOpacity>
  )}
</View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Student ID :</Text>
          <Text style={styles.infoValue}>{item.studentId}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Room :</Text>
          <View style={styles.roomBadge}>
            <Text style={styles.roomText}>{item.roomNumber}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
      <LinearGradient
  colors={[BG_TOP, BG_BOTTOM]}
  style={[styles.container, { paddingTop: insets.top + 8 }]}
>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topIconBtn}>
          <Ionicons name="menu" size={26} color="#555" />
        </TouchableOpacity>

        <View style={styles.topRight}>
          <TouchableOpacity style={styles.topIconBtn}>
            <Ionicons name="notifications-outline" size={22} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.topIconBtn}>
            <Ionicons name="person-circle-outline" size={28} color="#A9AFBE" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.screenTitle}>Student Management</Text>

      <View style={styles.statsGrid}>
        <StatCard
          icon="school-outline"
          count={stats.total}
          label="Total Students"
          accentColor="#BFE7DA"
          iconBg="#EDF8F5"
          iconColor="#4C8A73"
        />
        <StatCard
          icon="person"
          count={stats.active}
          label="Active"
          accentColor="#7CA85B"
          iconBg="#EEF6E8"
          iconColor="#52795E"
        />
        <StatCard
          icon="close-outline"
          count={stats.inactive}
          label="Inactive"
          accentColor="#FF3A30"
          iconBg="#EFF6FF"
          iconColor="#2F7DF6"
        />
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={20} color="#8B8B8B" />
        <TextInput
          placeholder="Search by Student ID, name or NIC."
          placeholderTextColor="#9A9A9A"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filterRow}>
        <FilterButton title="All" />
        <FilterButton title="Active" />
        <FilterButton title="Inactive" />
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={DARK_GREEN} />
        </View>
      ) : (
        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => item._id}
          renderItem={renderStudentCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchStudents();
          }}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No students found.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate("AddStudent")}
      >
        <Ionicons name="add" size={34} color="#fff" />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 14,
  },

  topBar: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  topIconBtn: {
    padding: 6,
  },

  screenTitle: {
    marginTop: 4,
    marginBottom: 10,
    fontSize: 30,
    fontWeight: "500",
    color: "#111",
  },

  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    rowGap: 10,
    marginBottom: 12,
  },
  statCard: {
    width: "31.5%",
    backgroundColor: "#F7F7F7",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderLeftWidth: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  statIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statCount: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
    lineHeight: 22,
  },
  statLabel: {
    marginTop: 2,
    fontSize: 12,
    color: "#4F4F4F",
    fontWeight: "500",
  },

  searchBox: {
    height: 46,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#111",
  },

  filterRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  filterBtn: {
    minWidth: 58,
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#E5E5E5",
    alignItems: "center",
    justifyContent: "center",
  },
  filterBtnActive: {
    backgroundColor: "#8FD5C3",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
  },
  filterTextActive: {
    color: "#1E5D4D",
  },

  listContent: {
    paddingBottom: 100,
  },

  studentCard: {
    backgroundColor: "#F7F7F7",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  nameStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  studentName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  activeBadge: {
    backgroundColor: "#CFF2D7",
  },
  inactiveBadge: {
    backgroundColor: "#FFD7D1",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  activeText: {
    color: "#2E9A4D",
  },
  inactiveText: {
    color: "#E14B3B",
  },

  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: 8,
  },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  infoLabel: {
    width: 82,
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#303030",
    fontWeight: "500",
  },
  roomBadge: {
    backgroundColor: "#DCE5E1",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roomText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },

  loaderWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyWrap: {
    marginTop: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#555",
    fontSize: 15,
  },

  fab: {
    position: "absolute",
    right: 18,
    bottom: 88,
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: "#8FD5C3",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
});