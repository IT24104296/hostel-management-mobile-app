// ═══════════════════════════════════════════════════════════════════
//  mobile-app/screens/ExpenseList.js  —  NEW FILE
//
//  PURPOSE:
//  Shows all hostel expenses in a scrollable list.
//  Each expense card shows: category badge, title, amount, date.
//  Each card has Edit and Delete buttons.
//
//  FEATURES:
//  • Fetches expenses from GET /api/expenses
//  • Shows total expenses at the top
//  • Category colour badges so user can scan by type quickly
//  • Edit → navigates to ExpenseForm with the expense pre-filled
//  • Delete → confirmation alert then DELETE /api/expenses/:id
//  • Loading state, error state, empty state all handled
//  • Refreshes automatically when returning from ExpenseForm
//    using useFocusEffect so newly added/edited expenses appear
// ═══════════════════════════════════════════════════════════════════

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

// ── Category colour map ───────────────────────────────────────────
// Each category gets a distinct background colour for its badge
// so users can instantly identify expense types while scrolling.
const CATEGORY_COLORS = {
  "Electricity":  { bg: "#FFF3E0", text: "#E65100" },
  "Water":        { bg: "#E3F2FD", text: "#0D47A1" },
  "Internet":     { bg: "#EDE7F6", text: "#4527A0" },
  "Maintenance":  { bg: "#FCE4EC", text: "#880E4F" },
  "Cleaning":     { bg: "#E8F5E9", text: "#1B5E20" },
  "Staff Salary": { bg: "#E0F7FA", text: "#006064" },
  "Other":        { bg: "#F5F5F5", text: "#424242" },
};

export default function ExpenseList({ navigation }) {

  const [expenses,    setExpenses]    = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  // ── Fetch expenses ────────────────────────────────────────────
  // useFocusEffect runs every time this screen comes into focus.
  // This means when user comes back from ExpenseForm after
  // adding or editing, the list automatically refreshes.
  useFocusEffect(
    useCallback(() => {
      fetchExpenses();
    }, [])
  );

  const fetchExpenses = () => {
    setLoading(true);
    setError(null);

    fetch("http://10.0.2.2:5000/api/expenses")
      .then(res => res.json())
      .then(data => {
        setExpenses(data.expenses);
        setTotalAmount(data.totalAmount);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setError("Failed to load expenses. Check your connection.");
        setLoading(false);
      });
  };

  // ── Delete expense ────────────────────────────────────────────
  const deleteExpense = (id) => {
    Alert.alert(
      "Delete Expense",
      "Are you sure you want to delete this expense?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            fetch(`http://10.0.2.2:5000/api/expenses/${id}`, {
              method: "DELETE",
            })
              .then(() => {
                // Remove from local state immediately
                const updated = expenses.filter(e => e._id !== id);
                setExpenses(updated);
                // Recalculate total
                const newTotal = updated.reduce((sum, e) => sum + e.amount, 0);
                setTotalAmount(newTotal);
              })
              .catch(err => {
                console.log(err);
                Alert.alert("Error", "Failed to delete expense.");
              });
          },
        },
      ]
    );
  };

  // ── Loading state ─────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#07810d" />
        <Text style={styles.loadingText}>Loading expenses...</Text>
      </View>
    );
  }

  // ── Error state ───────────────────────────────────────────────
  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchExpenses}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* ── HEADER TOTAL CARD ───────────────────────────────────── */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Expenses</Text>
        <Text style={styles.totalAmount}>Rs {totalAmount}</Text>
        <Text style={styles.totalCount}>{expenses.length} records</Text>
      </View>

      {/* ── EMPTY STATE ─────────────────────────────────────────── */}
      {expenses.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No expenses recorded yet.</Text>
          <Text style={styles.emptySubText}>
            Tap "Add Expense" below to record your first expense.
          </Text>
        </View>
      )}

      {/* ── EXPENSE LIST ────────────────────────────────────────── */}
      <FlatList
        data={expenses}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 90 }}
        renderItem={({ item }) => {

          // Get colour for this category badge
          const colors = CATEGORY_COLORS[item.category] || CATEGORY_COLORS["Other"];

          return (
            <View style={styles.card}>

              {/* Category badge + date row */}
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

              {/* Title and amount */}
              <Text style={styles.expenseTitle}>{item.title}</Text>
              <Text style={styles.expenseAmount}>Rs {item.amount}</Text>

              {/* Optional description */}
              {item.description ? (
                <Text style={styles.description}>{item.description}</Text>
              ) : null}

              {/* Edit and Delete buttons */}
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() =>
                    navigation.navigate("ExpenseForm", { expense: item })
                  }
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

      {/* ── ADD EXPENSE BUTTON (fixed at bottom) ────────────────── */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("ExpenseForm")}
      >
        <Text style={styles.addButtonText}>+ Add Expense</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },

  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  loadingText:  { marginTop: 12, fontSize: 14, color: "#777" },
  errorText:    { fontSize: 14, color: "#C62828", textAlign: "center", marginBottom: 16 },

  retryBtn:     { backgroundColor: "#07810d", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryBtnText: { color: "#fff", fontWeight: "bold" },

  // Total card at top
  totalCard: {
    backgroundColor: "#C62828",
    margin: 16,
    padding: 20,
    borderRadius: 14,
    elevation: 4,
  },

  totalLabel:  { fontSize: 13, color: "#ffcdd2", marginBottom: 4 },
  totalAmount: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  totalCount:  { fontSize: 12, color: "#ffcdd2", marginTop: 4 },

  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 40,
  },

  emptyText:    { fontSize: 16, color: "#555", fontWeight: "bold", marginBottom: 8 },
  emptySubText: { fontSize: 13, color: "#888", textAlign: "center" },

  // Expense card
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

  categoryText:  { fontSize: 12, fontWeight: "bold" },
  dateText:      { fontSize: 12, color: "#888" },
  expenseTitle:  { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 4 },
  expenseAmount: { fontSize: 20, fontWeight: "bold", color: "#C62828", marginBottom: 4 },
  description:   { fontSize: 13, color: "#777", marginBottom: 8 },

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

  // Fixed Add button at bottom
  addButton: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#07810d",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    elevation: 6,
  },

  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

});