// ─────────────────────────────────────────────────────────────────
//  screens/ReportList.js  —  CORRECTED
//
//  BUG FIXED: Raw ISO date strings displayed to user
//  Previously: <Text>From: {item.startDate}</Text>
//  This showed ugly strings like "2026-03-01T00:00:00.000Z"
//  because MongoDB returns dates as ISO 8601 strings.
//  FIX: Wrap with new Date(...).toLocaleDateString() to get
//  a clean readable format e.g. "3/1/2026".
//
//  IMPROVEMENT ADDED: Loading state + error handling
//  Previously, if the API was down the list would be silently
//  empty with no feedback. Added:
//    • loading spinner while fetching reports
//    • error message if fetch fails
//    • empty state message if no reports exist yet
// ─────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,   // ✅ ADDED: for loading spinner
} from "react-native";

export default function ReportList({ navigation }) {

  const [reports, setReports] = useState([]);

  // ✅ ADDED: loading and error states
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  // ✅ ADDED: extracted into a named function so it can be reused
  //           (e.g. called again after a delete to refresh the list)
  const fetchReports = () => {
    setLoading(true);
    setError(null);

    fetch("http://10.0.2.2:5000/api/financial/report")
      .then(res => res.json())
      .then(data => {
        setReports(data);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setError("Failed to load reports. Check your connection.");
        setLoading(false);
      });
  };

  // ── Delete report ─────────────────────────────────────────────
  const deleteReport = (id) => {
    Alert.alert(
      "Delete Report",
      "Are you sure you want to delete this report?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            fetch(`http://10.0.2.2:5000/api/financial/report/${id}`, {
              method: "DELETE",
            })
              .then(() => {
                // Remove from local state immediately (no need to re-fetch)
                setReports(reports.filter(r => r._id !== id));
              })
              .catch(err => {
                console.log(err);
                Alert.alert("Error", "Failed to delete report.");
              });
          },
        },
      ]
    );
  };

  // ── Loading state ─────────────────────────────────────────────
  // ✅ ADDED: show spinner while fetching
  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  // ── Error state ───────────────────────────────────────────────
  // ✅ ADDED: show error with a retry button
  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchReports}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Reports</Text>

      {/* ── EMPTY STATE ──────────────────────────────────────── */}
      {/* ✅ ADDED: friendly message when no reports exist yet */}
      {reports.length === 0 && (
        <View style={styles.centeredContainer}>
          <Text style={styles.emptyText}>No reports generated yet.</Text>
          <Text style={styles.emptySubText}>
            Go to Financial Summary and tap "Generate Report".
          </Text>
        </View>
      )}

      <FlatList
        data={reports}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>

            {/* ── DATE RANGE ────────────────────────────────── */}
            {/*
              BUG THAT WAS HERE (now fixed):
              <Text>From: {item.startDate}</Text>
              <Text>To:   {item.endDate}</Text>

              This displayed raw ISO strings like:
                "From: 2026-03-01T00:00:00.000Z"

              FIX: Parse and format with toLocaleDateString()
              Now displays:
                "From: 3/1/2026"
            */}
            <Text style={styles.dateText}>
              From: {new Date(item.startDate).toLocaleDateString()}  {/* ✅ FIXED */}
            </Text>
            <Text style={styles.dateText}>
              To:   {new Date(item.endDate).toLocaleDateString()}    {/* ✅ FIXED */}
            </Text>

            {/* ── AMOUNTS ───────────────────────────────────── */}
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

            {/* ── BUTTONS ───────────────────────────────────── */}
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
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F6FA",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },

  // ✅ ADDED styles
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#777",
  },

  errorText: {
    fontSize: 14,
    color: "#C62828",
    textAlign: "center",
    marginBottom: 16,
  },

  retryBtn: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },

  retryBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },

  emptyText: {
    fontSize: 16,
    color: "#555",
    fontWeight: "bold",
    marginBottom: 8,
  },

  emptySubText: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 3,
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
    marginBottom: 4,
  },

  amountBox: {
    width: "31%",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  totalBox:     { backgroundColor: "#E8F5E9" },
  collectedBox: { backgroundColor: "#E3F2FD" },
  pendingBox:   { backgroundColor: "#FFF3E0" },

  amountLabel: {
    fontSize: 11,
    color: "#777",
    marginBottom: 4,
  },

  amountValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#333",
  },

  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 10,
  },

  viewBtn: {
    flex: 1,
    backgroundColor: "#2E7D32",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  deleteBtn: {
    flex: 1,
    backgroundColor: "#C62828",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

});