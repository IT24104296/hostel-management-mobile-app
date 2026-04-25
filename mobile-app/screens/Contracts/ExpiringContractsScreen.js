import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import api from "../../services/api";

export default function ExpiringContractsScreen() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchContracts = async () => {
    try {
      const res = await api.get("/api/contracts");

      const today = new Date();

      const expiring = res.data
        .map((item) => {
          const end = new Date(item.endDate);
          const diffDays = Math.ceil(
            (end - today) / (1000 * 60 * 60 * 24)
          );

          return {
            id: item._id,
            name: item.studentName,
            room: `Room ${item.roomNumber}`,
            endDate: end.toDateString(),
            daysLeft: diffDays > 0 ? diffDays : 0,
          };
        })
        // Only future contracts (not expired)
        .filter((item) => item.daysLeft > 0)
        // Sort by nearest expiry first
        .sort((a, b) => a.daysLeft - b.daysLeft);

      setContracts(expiring);
    } catch (err) {
      console.log(err);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  // Pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchContracts();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const getUrgencyStyle = (days) => {
    if (days <= 7) return { color: "#EF4444", bg: "#FEE2E2" };     // Urgent - Red
    if (days <= 30) return { color: "#F59E0B", bg: "#FEF3C7" };   // Warning - Orange
    return { color: "#10B981", bg: "#D1FAE5" };                   // Normal - Green
  };

  const renderItem = ({ item }) => {
    const urgency = getUrgencyStyle(item.daysLeft);

    return (
      <View style={styles.card}>
        {/* Urgency Badge */}
        <View style={[styles.urgencyBadge, { backgroundColor: urgency.bg }]}>
          <MaterialIcons name="warning" size={18} color={urgency.color} />
          <Text style={[styles.urgencyText, { color: urgency.color }]}>
            {item.daysLeft} days left
          </Text>
        </View>

        {/* Student Name */}
        <Text style={styles.cardName}>{item.name}</Text>

        {/* Room */}
        <Text style={styles.cardRoom}>{item.room}</Text>

        {/* End Date */}
        <Text style={styles.dateLabel}>Expires on</Text>
        <Text style={styles.cardDate}>{item.endDate}</Text>
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
          data={contracts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={styles.container}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Expiring Contracts</Text>
              <Text style={styles.headerSubtitle}>
                Contracts that need attention soon
              </Text>
            </View>
          }
          ListEmptyComponent={
            !loading && (
              <View style={styles.emptyContainer}>
                <MaterialIcons
                  name="event-available"
                  size={72}
                  color="rgba(255,255,255,0.7)"
                />
                <Text style={styles.emptyTitle}>No expiring contracts</Text>
                <Text style={styles.emptySubtitle}>
                  All contracts are safe for now
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
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  gradient: {
    flex: 1, // ✅ REQUIRED
  },

  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 30,
  },

  header: {
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1F2937", // ✅ dark like home screen
  },

  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    position: "relative",
  },

  urgencyBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  urgencyText: {
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },

  cardName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
    paddingRight: 100,
  },

  cardRoom: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 10,
  },

  dateLabel: {
    fontSize: 12,
    color: "#94A3B8",
  },

  cardDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },

  emptyContainer: {
    flex: 1, 
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 12,
  },

  emptySubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 30,
  },
});