import React, { useState, useCallback } from "react";
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

// Category colors (kept exactly as you had)
const CATEGORY_COLORS = {
  "Electricity": { bg: "#FFF3E0", text: "#E65100" },
  "Water": { bg: "#E3F2FD", text: "#0D47A1" },
  "Internet": { bg: "#EDE7F6", text: "#4527A0" },
  "Maintenance": { bg: "#FCE4EC", text: "#880E4F" },
  "Cleaning": { bg: "#E8F5E9", text: "#1B5E20" },
  "Staff Salary": { bg: "#E0F7FA", text: "#006064" },
  "Other": { bg: "#F5F5F5", text: "#424242" },
};

export default function ExpenseList({ navigation }) {
  const insets = useSafeAreaInsets();

  const [expenses, setExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch expenses every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchExpenses();
    }, [])
  );

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/api/expenses");
      setExpenses(res.expenses || res.data?.expenses || []);
      setTotalAmount(res.totalAmount || res.data?.totalAmount || 0);
    } catch (err) {
      console.error("Expense list fetch error:", err);
      setError("Failed to load expenses. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = (id) => {
    Alert.alert(
      "Delete Expense",
      "Are you sure you want to delete this expense?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/api/expenses/${id}`);
              // Remove from local state
              const updated = expenses.filter((e) => e._id !== id);
              setExpenses(updated);
              const newTotal = updated.reduce((sum, e) => sum + e.amount, 0);
              setTotalAmount(newTotal);
            } catch (err) {
              console.error(err);
              Alert.alert("Error", "Failed to delete expense.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={["#F4FBF8", "#BFE5DB"]} style={styles.container}>
        <ActivityIndicator size="large" color="#58A895" style={{ flex: 1 }} />
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
        <Text style={styles.screenTitle}>Expenses</Text>
      </View>

      {/* Total Card */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Expenses</Text>
        <Text style={styles.totalAmount}>Rs {totalAmount}</Text>
        <Text style={styles.totalCount}>{expenses.length} records</Text>
      </View>

      {/* Empty State */}
      {expenses.length === 0 && !error && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No expenses recorded yet</Text>
          <Text style={styles.emptySubText}>Tap + Add Expense to get started</Text>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchExpenses}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Expense List */}
      <FlatList
        data={expenses}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const colors = CATEGORY_COLORS[item.category] || CATEGORY_COLORS["Other"];

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.categoryBadge, { backgroundColor: colors.bg }]}>
                  <Text style={[styles.categoryText, { color: colors.text }]}>
                    {item.category}
                  </Text>
                </View>
                <Text style={styles.dateText}>
                  {new Date(item.date).toLocaleDateString()}
                </Text>
              </View>

              <Text style={styles.expenseTitle}>{item.title}</Text>
              <Text style={styles.expenseAmount}>Rs {item.amount}</Text>

              {item.description ? (
                <Text style={styles.description}>{item.description}</Text>
              ) : null}

              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => navigation.navigate("ExpenseForm", { expense: item })}
                >
                  <Text style={styles.btnText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => deleteExpense(item._id)}
                >
                  <Text style={styles.btnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("ExpenseForm")}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
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

  totalCard: {
    backgroundColor: "#C62828",
    margin: 16,
    padding: 20,
    borderRadius: 14,
    elevation: 4,
  },
  totalLabel: { fontSize: 13, color: "#ffcdd2", marginBottom: 4 },
  totalAmount: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  totalCount: { fontSize: 12, color: "#ffcdd2", marginTop: 4 },

  listContainer: { paddingBottom: 100 },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  categoryText: { fontSize: 12, fontWeight: "bold" },
  dateText: { fontSize: 12, color: "#888" },
  expenseTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 4 },
  expenseAmount: { fontSize: 20, fontWeight: "bold", color: "#C62828", marginBottom: 4 },
  description: { fontSize: 13, color: "#777", marginBottom: 8 },

  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 10,
  },

  editBtn: {
    flex: 1,
    backgroundColor: "#1565C0",
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

  btnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },

  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 62,
    height: 62,
    backgroundColor: "#07810d",
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },

  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyText: { fontSize: 16, color: "#555", fontWeight: "bold", marginBottom: 8 },
  emptySubText: { fontSize: 13, color: "#888", textAlign: "center" },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: { color: "#C62828", fontSize: 16, textAlign: "center", marginBottom: 16 },
  retryBtn: {
    backgroundColor: "#07810d",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryBtnText: { color: "#fff", fontWeight: "bold" },
});