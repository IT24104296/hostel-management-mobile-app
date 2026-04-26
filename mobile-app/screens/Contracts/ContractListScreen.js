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

export default function ContractListScreen({ navigation }) {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // ✅ DELETE CONTRACT
  const deleteContract = async (item) => {
    Alert.alert(
      "Delete Contract",
      `Are you sure you want to delete ${item.name}'s contract?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/api/contracts/${item.id}`);
              setContracts((prev) => prev.filter((c) => c.id !== item.id));
            } catch (err) {
              Alert.alert("Error", "Failed to delete contract");
            }
          },
        },
      ]
    );
  };

  // ✅ EDIT CONTRACT
  const editContract = (item) => {
    navigation.navigate("EditContract", { contract: item }); // Change to your actual Edit screen if different
  };

  // ✅ FETCH CONTRACTS
  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/contracts");

      const apiData = res.data.map((item) => {
        const today = new Date();
        const end = new Date(item.endDate);

        let status = "Active";
        if (end < today) status = "Expired";

        return {
          id: item._id,
          name: item.studentName,
          room: `Room ${item.roomNumber}`,
          studentId: item.studentId,
          startDate: new Date(item.moveInDate).toDateString(),
          endDate: new Date(item.endDate).toDateString(),
          status,
          contactNumber: item.contactNumber,
        };
      });

      setContracts(apiData);
    } catch (err) {
      console.log("ERROR:", err);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchContracts();
    setRefreshing(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchContracts);
    return unsubscribe;
  }, [navigation]);

  // Search filter (by student ID or name)
  const filteredContracts = contracts.filter(
    (item) =>
      item.studentId.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const isActive = item.status === "Active";
    const statusColor = isActive ? "#10B981" : "#F59E0B";

    return (
      <View style={styles.card}>
  {/* Status Badge */}
  <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
    <Text style={styles.statusText}>{item.status}</Text>
  </View>

  {/* Student Name */}
  <Text style={styles.cardName}>{item.name}</Text>

  {/* Room & ID */}
  <Text style={styles.cardInfo}>
    {item.room} • {item.studentId}
  </Text>

  {/* Contact */}
  <Text style={styles.cardContact}>{item.contactNumber}</Text>

  {/* Dates */}
  <Text style={styles.dateRange}>
    {item.startDate} — {item.endDate}
  </Text>

  {/* Action Buttons - Only Delete remains */}
  <View style={styles.actionRow}>
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => deleteContract(item)}
    >
      <MaterialIcons name="delete" size={22} color="#EF4444" />
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  </View>
</View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

   <LinearGradient
  colors={["#E6F2EF", "#BFDAD5"]}
  style={[styles.gradient, styles.container]}
>
        <FlatList
          data={filteredContracts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={styles.container}
          ListHeaderComponent={
            <>
              {/* Modern Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Contract List</Text>
                <Text style={styles.headerSubtitle}>
                  Manage all student contracts
                </Text>
              </View>

              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <MaterialIcons
                  name="search"
                  size={24}
                  color="#64748B"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by name or ID..."
                  placeholderTextColor="#94A3B8"
                  value={search}
                  onChangeText={setSearch}
                />
              </View>

              {/* Filter Buttons */}
              <View style={styles.filters}>
                <TouchableOpacity style={[styles.filterBtn, styles.activeFilter]}>
                  <Text style={styles.filterTextActive}>All Contracts</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.filterBtn}
                  onPress={() => navigation.navigate("ExpiringContracts")}
                >
                  <Text style={styles.filterText}>Expiring Soon</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.filterBtn}
                  onPress={() => navigation.navigate("ContractHistory")}
                >
                  <Text style={styles.filterText}>Expired</Text>
                </TouchableOpacity>
              </View>
            </>
          }
          ListEmptyComponent={
  !loading && (
    <View style={styles.emptyContainer}>
      <MaterialIcons 
        name="assignment" 
        size={80} 
        color="#2E8B7D"        // ← changed to visible teal
      />
      <Text style={styles.emptyTitle}>No contracts found</Text>
      <Text style={styles.emptySubtitle}>
        {search ? "Try a different search term" : "Add your first contract"}
      </Text>
    </View>
  )
}
          ListFooterComponent={
            loading && contracts.length === 0 ? (
              <ActivityIndicator size="large" color="#ffffff" style={{ marginTop: 40 }} />
            ) : null
          }
        />

        {/* Modern Floating Action Button - FIXED */}
<TouchableOpacity
  style={styles.fab}
  onPress={() => navigation.navigate("AddContract")}
>
  <LinearGradient
    colors={["#2E8B7D", "#1F6A5E"]}   // ← single nice gradient (or just one color)
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

  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 100,
  },

  // 🔹 Header (match other screens)
  header: {
    marginBottom: 16,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
  },

  headerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },

  // 🔹 Search (soft card style)
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

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },

  // 🔹 Filters (like student module)
  filters: {
    flexDirection: "row",
    marginBottom: 16,
  },

  filterBtn: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },

  activeFilter: {
    backgroundColor: "#2E8B7D",
  },

  filterText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "500",
  },

  filterTextActive: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },

  // 🔹 Card (match room/student cards)
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  // 🔹 Status badge (soft style)
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },

  // 🔹 Text styles
  cardName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
    paddingRight: 80,
  },

  cardInfo: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },

  cardContact: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 6,
  },

  dateRange: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 10,
  },

  // 🔹 Actions (icons cleaner)
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  editButton: {
    marginRight: 16,
  },

  editText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2E8B7D",
  },

  deleteButton: {},

  deleteText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#EF4444",
  },

  // 🔹 Floating Button (match app FAB)
 fab: {
  position: "absolute",
  bottom: 24,
  right: 24,
  width: 56,
  height: 56,
  borderRadius: 28,
  // backgroundColor removed ← this was causing the two-color mess
  justifyContent: "center",
  alignItems: "center",
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

  

  // 🔹 Empty state (soft)
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginTop: 10,
  },

  emptySubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 4,
  },
});