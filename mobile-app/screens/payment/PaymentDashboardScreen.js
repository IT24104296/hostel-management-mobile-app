import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import api from "../../services/api";

export default function PaymentDashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState({
    totalActive: 0,
    overdueCount: 0,
    dueTodayCount: 0,
    dueSoonCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/payments/dashboard");
      setStudents(res.data.students || []);
      setSummary(res.data.summary || {});
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      Alert.alert("Error", "Failed to load payment dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchText.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === "all") return true;
    if (activeFilter === "overdue") return student.paymentStatus === "overdue";
    if (activeFilter === "due_today") return student.paymentStatus === "due_today";
    if (activeFilter === "due_soon") return student.paymentStatus === "due_soon";
    if (activeFilter === "paid") return student.paymentStatus === "paid";
    return true;
  });

  const renderStudent = ({ item }) => {
    const statusStyle = getStatusColor(item.paymentStatus);

    return (
      <TouchableOpacity
        style={styles.studentCard}
        onPress={() =>
          navigation.navigate("StudentPaymentDetail", { studentId: item._id })
        }
      >
        <View style={styles.studentInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👨‍🎓</Text>
          </View>
          <View style={styles.details}>
            <Text style={styles.studentName}>{item.fullName}</Text>
            <Text style={styles.roomText}>
              Room {item.room?.roomNumber || "—"}
            </Text>
            <Text style={styles.dueText}>
              Due: {item.dueDateDisplay || "—"}
            </Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {statusStyle.label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "overdue":
        return { bg: "#FEE2E2", text: "#B91C1C", label: "Overdue" };
      case "due_today":
        return { bg: "#FEF3C7", text: "#B45309", label: "Due Today" };
      case "due_soon":
        return { bg: "#DBEAFE", text: "#1E40AF", label: "Due Soon" };
      case "paid":
        return { bg: "#D1FAE5", text: "#10B981", label: "Paid" };
      default:
        return { bg: "#E0F2F1", text: "#0F766E", label: "Active" };
    }
  };

  return (
    <LinearGradient
      colors={["#F4FBF8", "#BFE5DB"]}
      style={[styles.container, { paddingTop: insets.top + 8}]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Payments</Text>
          <TouchableOpacity onPress={fetchDashboard}>
            <Ionicons name="refresh" size={24} color="#58A895" />
          </TouchableOpacity>
        </View>

        {/* === PREMIUM STAT CARDS (New Design) === */}
        <View style={styles.summaryContainer}>
          {/* Total Active */}
          <View style={styles.statCard}>
            <View style={styles.statIconWrapper}>
              <Ionicons name="people" size={32} color="#58A895" />
            </View>
            <Text style={styles.statNumber}>{summary.totalActive}</Text>
            <Text style={styles.statLabel}>Total Active</Text>
          </View>

          {/* Overdue */}
          <View style={[styles.statCard, styles.overdueCard]}>
            <View style={styles.statIconWrapper}>
              <Ionicons name="alert-circle" size={32} color="#EF4444" />
            </View>
            <Text style={[styles.statNumber, { color: "#EF4444" }]}>
              {summary.overdueCount}
            </Text>
            <Text style={[styles.statLabel, { color: "#EF4444" }]}>Overdue</Text>
          </View>

          {/* Due Today */}
          <View style={[styles.statCard, styles.dueTodayCard]}>
            <View style={styles.statIconWrapper}>
              <Ionicons name="calendar" size={32} color="#F59E0B" />
            </View>
            <Text style={[styles.statNumber, { color: "#F59E0B" }]}>
              {summary.dueTodayCount}
            </Text>
            <Text style={[styles.statLabel, { color: "#F59E0B" }]}>Due Today</Text>
          </View>

          {/* Due Soon */}
          <View style={[styles.statCard, styles.dueSoonCard]}>
            <View style={styles.statIconWrapper}>
              <Ionicons name="time-outline" size={32} color="#3B82F6" />
            </View>
            <Text style={[styles.statNumber, { color: "#3B82F6" }]}>
              {summary.dueSoonCount}
            </Text>
            <Text style={[styles.statLabel, { color: "#3B82F6" }]}>Due Soon</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search student name or ID..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {["all", "overdue", "due_today", "due_soon", "paid"].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                activeFilter === filter && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter === "all"
                  ? "All"
                  : filter === "due_today"
                  ? "Due Today"
                  : filter === "due_soon"
                  ? "Due Soon"
                  : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Student List */}
        {loading ? (
          <ActivityIndicator size="large" color="#58A895" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={filteredStudents}
            keyExtractor={(item) => item._id}
            renderItem={renderStudent}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={<Text style={styles.emptyText}>No students found</Text>}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: "700", color: "#111" },

  /* === NEW PREMIUM STAT CARDS === */
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
    borderWidth: 1,
    borderColor: "#F0F4F2",
  },
  statIconWrapper: { marginBottom: 10 },
  statNumber: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#555",
  },

  /* Accent colors for each card */
  overdueCard: { borderColor: "#FECACA", backgroundColor: "#FEF2F2" },
  dueTodayCard: { borderColor: "#FDE68C", backgroundColor: "#FFFBEB" },
  dueSoonCard: { borderColor: "#BFDBFE", backgroundColor: "#F0F9FF" },

  /* Search, Filters, Student Card (unchanged) */
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: "#111" },

  filterScroll: { marginBottom: 16 },
  filterChip: {
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 30,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  filterChipActive: { backgroundColor: "#58A895", borderColor: "#58A895" },
  filterText: { fontSize: 14, fontWeight: "600", color: "#555" },
  filterTextActive: { color: "#fff" },

  studentCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  studentInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E0F2F1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: { fontSize: 22 },
  details: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: "700", color: "#111" },
  roomText: { fontSize: 13, color: "#666", marginTop: 2 },
  dueText: { fontSize: 13, color: "#777", marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: { fontSize: 12, fontWeight: "700" },

  listContainer: { paddingBottom: 20 },
  emptyText: { textAlign: "center", color: "#888", fontSize: 16, marginTop: 50 },
});