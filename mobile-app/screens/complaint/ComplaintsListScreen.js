import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import api from "../../services/api";

export default function ComplaintsListScreen({ navigation }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All"); // All, Pending, In Progress, Resolved

  // ✅ FETCH ALL COMPLAINTS
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/complaints");

      setComplaints(res.data.complaints || res.data);
    } catch (err) {
      console.log("ERROR fetching complaints:", err);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchComplaints();
    setRefreshing(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchComplaints);
    return unsubscribe;
  }, [navigation]);

  // ✅ DELETE COMPLAINT
  const deleteComplaint = async (item) => {
    Alert.alert(
      "Delete Complaint",
      `Are you sure you want to delete "${item.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/api/complaints/${item._id}`);
              setComplaints((prev) => prev.filter((c) => c._id !== item._id));
            } catch (err) {
              Alert.alert("Error", "Failed to delete complaint");
            }
          },
        },
      ]
    );
  };

  // ✅ EDIT COMPLAINT
  const editComplaint = (item) => {
    navigation.navigate("EditComplaint", { complaint: item });
  };

  // ✅ VIEW DETAIL
  const viewComplaint = (item) => {
    navigation.navigate("ComplaintDetail", { complaint: item });
  };

  // Filter complaints
  const filteredComplaints = complaints.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.roomNumber?.toLowerCase().includes(search.toLowerCase()) ||
      item.studentName?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === "All" || item.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const renderItem = ({ item }) => {
  const priorityColor =
    item.priority === "High"
      ? "#EF4444"
      : item.priority === "Medium"
      ? "#F59E0B"
      : "#10B981";

  const statusColor =
    item.status === "Pending"
      ? "#F59E0B"
      : item.status === "In Progress"
      ? "#3B82F6"
      : "#10B981";

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => viewComplaint(item)}   // ← This makes the whole card tappable
      activeOpacity={0.9}
    >
      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>

      {/* Priority Badge */}
      <View style={[styles.priorityBadge, { backgroundColor: priorityColor + "20" }]}>
        <Text style={[styles.priorityText, { color: priorityColor }]}>
          {item.priority}
        </Text>
      </View>

      {/* Title */}
      <Text style={styles.cardTitle}>{item.title}</Text>

      {/* Room & Student */}
      <Text style={styles.cardInfo}>
        Room {item.roomNumber} {item.studentName ? `• ${item.studentName}` : ""}
      </Text>

      {/* Category */}
      <Text style={styles.categoryText}>{item.category}</Text>

      {/* Reported Date */}
      <Text style={styles.dateText}>
        Reported: {new Date(item.createdAt).toDateString()}
      </Text>

      {/* Action Buttons (still keep Edit & Delete) */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.editButton} onPress={() => editComplaint(item)}>
          <MaterialIcons name="edit" size={18} color="#10B981" />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteComplaint(item)}>
          <MaterialIcons name="delete" size={18} color="#EF4444" />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={["#E6F2EF", "#BFDAD5"]}
        style={styles.gradient}
      >
        <FlatList
          data={filteredComplaints}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={styles.container}
          ListHeaderComponent={
            <>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Maintenance & Complaints</Text>
                <Text style={styles.headerSubtitle}>Track and resolve issues</Text>
              </View>

              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={24} color="#64748B" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by title, room or student..."
                  placeholderTextColor="#94A3B8"
                  value={search}
                  onChangeText={setSearch}
                />
              </View>

              {/* Status Filter Chips */}
              <View style={styles.filters}>
                {["All", "Pending", "In Progress", "Resolved"].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterBtn,
                      filterStatus === status && styles.activeFilter,
                    ]}
                    onPress={() => setFilterStatus(status)}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        filterStatus === status && styles.filterTextActive,
                      ]}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          }
          ListEmptyComponent={
            !loading && (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="build" size={80} color="#2E8B7D" />
                <Text style={styles.emptyTitle}>No complaints found</Text>
                <Text style={styles.emptySubtitle}>
                  {search ? "Try a different search term" : "Add your first complaint"}
                </Text>
              </View>
            )
          }
        />

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("AddComplaint")}
        >
          <LinearGradient
            colors={["#2E8B7D", "#1F6A5E"]}
            style={styles.fabGradient}
          >
            <MaterialIcons name="add" size={28} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  gradient: { flex: 1 },
  container: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 100 },

  header: { marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#1F2937" },
  headerSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 2 },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: "#111827" },

  filters: { flexDirection: "row", marginBottom: 16, flexWrap: "wrap" },
  filterBtn: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilter: { backgroundColor: "#2E8B7D" },
  filterText: { color: "#374151", fontSize: 13, fontWeight: "500" },
  filterTextActive: { color: "#ffffff", fontWeight: "600" },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: { fontSize: 11, fontWeight: "600", color: "#fff" },

  priorityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 6,
  },
  priorityText: { fontSize: 11, fontWeight: "600" },

  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 4 },
  cardInfo: { fontSize: 13, color: "#6B7280", marginBottom: 4 },
  categoryText: { fontSize: 13, color: "#374151", marginBottom: 6 },
  dateText: { fontSize: 12, color: "#9CA3AF" },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 8,
  },
  editButton: {
    flex: 1,
    backgroundColor: "#E6F2EF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  editText: { color: "#10B981", fontWeight: "600", fontSize: 13, marginLeft: 6 },

  deleteButton: {
    flex: 1,
    backgroundColor: "#FEE2E2",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  deleteText: { color: "#EF4444", fontWeight: "600", fontSize: 13, marginLeft: 6 },

  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyContainer: { alignItems: "center", marginTop: 80 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#374151", marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: "#9CA3AF", textAlign: "center", marginTop: 4 },
});