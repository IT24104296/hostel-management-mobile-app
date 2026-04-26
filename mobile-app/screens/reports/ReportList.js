import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import api from "../../services/api";

export default function ReportList({ navigation }) {
  const insets = useSafeAreaInsets();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch reports every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [])
  );

  const fetchReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/api/financial/report");
      setReports(res || res.data || []);
    } catch (err) {
      console.error("Report list fetch error:", err);
      setError("Failed to load saved reports. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = (id) => {
    Alert.alert(
      "Delete Report",
      "Are you sure you want to delete this report?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/api/financial/report/${id}`);
              // Remove from local state
              setReports(reports.filter((r) => r._id !== id));
            } catch (err) {
              console.error(err);
              Alert.alert("Error", "Failed to delete report.");
            }
          },
        },
      ]
    );
  };

  // Loading state
  if (loading) {
    return (
      <LinearGradient colors={["#F4FBF8", "#BFE5DB"]} style={styles.container}>
        <ActivityIndicator size="large" color="#58A895" style={{ flex: 1 }} />
      </LinearGradient>
    );
  }

  // Error state
  if (error) {
    return (
      <LinearGradient colors={["#F4FBF8", "#BFE5DB"]} style={styles.container}>
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchReports}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#F4FBF8", "#BFE5DB"]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Saved Reports</Text>
      </View>

      {/* Empty State */}
      {reports.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No reports generated yet</Text>
          <Text style={styles.emptySubText}>
            Go to Financial Summary and tap "Generate Report"
          </Text>
        </View>
      )}

      {/* Reports List */}
      <FlatList
        data={reports}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Date Range */}
            <Text style={styles.dateText}>
              From: {new Date(item.startDate).toLocaleDateString()}
            </Text>
            <Text style={styles.dateText}>
              To: {new Date(item.endDate).toLocaleDateString()}
            </Text>

            {/* Amounts */}
            <View style={styles.amountRow}>
              <View style={[styles.amountBox, styles.totalBox]}>
                <Text style={styles.amountLabel}>Total</Text>
                <Text style={styles.amountValue}>Rs {item.totalIncome}</Text>
              </View>
              <View style={[styles.amountBox, styles.collectedBox]}>
                <Text style={styles.amountLabel}>Collected</Text>
                <Text style={styles.amountValue}>Rs {item.collected}</Text>
              </View>
              <View style={[styles.amountBox, styles.pendingBox]}>
                <Text style={styles.amountLabel}>Pending</Text>
                <Text style={styles.amountValue}>Rs {item.pending}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.viewBtn}
                onPress={() => navigation.navigate("Report", { report: item })}
              >
                <Text style={styles.btnText}>View</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deleteReport(item._id)}
              >
                <Text style={styles.btnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 6, marginRight: 12 },
  screenTitle: { fontSize: 24, fontWeight: "700", color: "#111" },

  listContainer: { paddingBottom: 100, paddingHorizontal: 16 },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  dateText: {
    fontSize: 13,
    color: "#555",
    marginBottom: 4,
  },

  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 8,
  },

  amountBox: {
    width: "31%",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  totalBox: { backgroundColor: "#E8F5E9" },
  collectedBox: { backgroundColor: "#E3F2FD" },
  pendingBox: { backgroundColor: "#FFF3E0" },

  amountLabel: { fontSize: 11, color: "#777", marginBottom: 4 },
  amountValue: { fontSize: 14, fontWeight: "bold", color: "#333" },

  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 12,
  },

  viewBtn: {
    flex: 1,
    backgroundColor: "#2E7D32",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  deleteBtn: {
    flex: 1,
    backgroundColor: "#C62828",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  btnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },

  // Empty & Error states
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: { fontSize: 17, color: "#555", fontWeight: "bold", marginBottom: 8 },
  emptySubText: { fontSize: 14, color: "#888", textAlign: "center" },

  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  errorText: { color: "#C62828", fontSize: 16, textAlign: "center", marginBottom: 16 },

  retryBtn: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },

  retryBtnText: { color: "#fff", fontWeight: "bold" },
});