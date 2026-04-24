// ═══════════════════════════════════════════════════════════════════
//  mobile-app/screens/financial.js  —  UPDATED
//
//  CHANGES FROM PREVIOUS VERSION:
//  1. Fetches total expenses alongside income summary
//  2. Added 4th summary card: Net Balance (income - expenses)
//     Card turns red if net balance is negative (loss)
//     Card stays green if positive (profit)
//  3. Added "Manage Expenses" button to navigate to ExpenseList
//
//  All previous bug fixes are preserved:
//  • Single date validation check
//  • Loading state + error state
//  • Disabled button while generating
// ═══════════════════════════════════════════════════════════════════

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function FinancialScreen({ navigation }) {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  const [summary, setSummary] = useState({
    totalIncome: 0,
    collected:   0,
    pending:     0,
  });

  // ✅ NEW: Expense total state
  const [totalExpenses, setTotalExpenses] = useState(0);

  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [generating, setGenerating] = useState(false);

  const [startDate, setStartDate] = useState(startOfYear);
  const [endDate,   setEndDate]   = useState(today);
  const [showStart, setShowStart] = useState(false);
  const [showEnd,   setShowEnd]   = useState(false);

  // ── Fetch summary and expenses when dates change ──────────────
  useEffect(() => {
    const start = startDate.toISOString().split("T")[0];
    const end   = endDate.toISOString().split("T")[0];

    setLoading(true);
    setError(null);

    // ✅ NEW: Fetch both income summary and expenses in parallel
    // Promise.all runs both fetches simultaneously for speed
    Promise.all([
      fetch(`http://10.0.2.2:5000/api/financial/summary?start=${start}&end=${end}`)
        .then(res => res.json()),
      fetch(`http://10.0.2.2:5000/api/expenses?start=${start}&end=${end}`)
        .then(res => res.json()),
    ])
      .then(([summaryData, expenseData]) => {
        setSummary(summaryData);
        setTotalExpenses(expenseData.totalAmount || 0);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setError("Failed to load financial data. Check your connection.");
        setLoading(false);
      });

  }, [startDate, endDate]);

  // ── Net balance calculation ───────────────────────────────────
  // ✅ NEW: Calculated on the fly from current state values
  const netBalance = summary.totalIncome - totalExpenses;

  // ── Generate report ───────────────────────────────────────────
  const generateReport = async () => {
    try {
      const start = startDate.toISOString().split("T")[0];
      const end   = endDate.toISOString().split("T")[0];

      // Single date validation check (bug fix from before)
      if (endDate < startDate) {
        alert("End date cannot be before start date.");
        return;
      }

      setGenerating(true);

      const response = await fetch("http://10.0.2.2:5000/api/financial/report", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ start, end }),
      });

      const data = await response.json();
      console.log("Report Generated:", data);

      setGenerating(false);
      alert("Report Generated Successfully ✅");
      navigation.navigate("Reports");

    } catch (error) {
      console.log(error);
      setGenerating(false);
      alert("Error generating report.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* ── DATE RANGE ──────────────────────────────────────────── */}
      <View style={styles.dateContainer}>
        <TouchableOpacity
          style={styles.dateBox}
          onPress={() => setShowStart(true)}
        >
          <Text style={styles.dateLabel}>Start Date</Text>
          <Text style={styles.dateValue}>{startDate.toDateString()}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateBox}
          onPress={() => setShowEnd(true)}
        >
          <Text style={styles.dateLabel}>End Date</Text>
          <Text style={styles.dateValue}>{endDate.toDateString()}</Text>
        </TouchableOpacity>
      </View>

      {showStart && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStart(false);
            if (selectedDate) setStartDate(selectedDate);
          }}
        />
      )}

      {showEnd && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowEnd(false);
            if (selectedDate) setEndDate(selectedDate);
          }}
        />
      )}

      {/* ── TITLE ───────────────────────────────────────────────── */}
      <Text style={styles.title}>Financial Summary</Text>

      {/* ── LOADING ─────────────────────────────────────────────── */}
      {loading && (
        <ActivityIndicator size="large" color="#07810d" style={{ marginBottom: 20 }} />
      )}

      {/* ── ERROR ───────────────────────────────────────────────── */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* ── SUMMARY CARDS ───────────────────────────────────────── */}
      {!loading && !error && (
        <>
          <View style={[styles.card, styles.expectedCard]}>
            <Text style={styles.cardTitle}>Total Expected Income</Text>
            <Text style={styles.amount}>Rs {summary.totalIncome}</Text>
          </View>

          <View style={[styles.card, styles.collectedCard]}>
            <Text style={styles.cardTitle}>Total Collected</Text>
            <Text style={styles.amount}>Rs {summary.collected}</Text>
          </View>

          <View style={[styles.card, styles.pendingCard]}>
            <Text style={styles.cardTitle}>Total Pending</Text>
            <Text style={styles.amount}>Rs {summary.pending}</Text>
          </View>

          {/* ✅ NEW: Expenses card */}
          <View style={[styles.card, styles.expenseCard]}>
            <Text style={styles.cardTitle}>Total Expenses</Text>
            <Text style={styles.amount}>Rs {totalExpenses}</Text>
          </View>

          {/* ✅ NEW: Net balance card — red if loss, green if profit */}
          <View style={[
            styles.card,
            netBalance >= 0 ? styles.profitCard : styles.lossCard
          ]}>
            <Text style={styles.cardTitle}>Net Balance</Text>
            <Text style={styles.amount}>Rs {netBalance}</Text>
            <Text style={styles.balanceNote}>
              {netBalance >= 0 ? "Profit" : "Loss"}
            </Text>
          </View>
        </>
      )}

      {/* ── BUTTONS ─────────────────────────────────────────────── */}
      <TouchableOpacity
        style={[styles.button, generating && styles.buttonDisabled]}
        onPress={generateReport}
        disabled={generating}
      >
        <Text style={styles.buttonText}>
          {generating ? "Generating..." : "Generate Report"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate("Reports")}
      >
        <Text style={styles.buttonText}>View Saved Reports</Text>
      </TouchableOpacity>

      {/* ✅ NEW: Navigate to expense management */}
      <TouchableOpacity
        style={styles.expenseButton}
        onPress={() => navigation.navigate("Expenses")}
      >
        <Text style={styles.buttonText}>Manage Expenses</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    padding: 20,
    backgroundColor: "#F5F6FA",
    flexGrow: 1,
  },

  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  dateBox: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    width: "48%",
  },

  dateLabel: { fontSize: 11, color: "#888", marginBottom: 4 },
  dateValue: { fontSize: 13, color: "#333", fontWeight: "500" },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
    color: "#333",
  },

  errorBox: {
    backgroundColor: "#FFEBEE",
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
  },

  errorText: { color: "#C62828", fontSize: 14, textAlign: "center" },

  card: {
    padding: 25,
    borderRadius: 18,
    marginBottom: 16,
    elevation: 5,
  },

  cardTitle: { fontSize: 16, color: "#555", marginBottom: 10 },

  amount: { fontSize: 24, fontWeight: "bold", color: "#333" },

  balanceNote: { fontSize: 13, color: "#555", marginTop: 4 },

  expectedCard:  { backgroundColor: "#E8F5E9" },
  collectedCard: { backgroundColor: "#E3F2FD" },
  pendingCard:   { backgroundColor: "#FFF3E0" },
  expenseCard:   { backgroundColor: "#FCE4EC" },  // ✅ NEW
  profitCard:    { backgroundColor: "#E8F5E9" },  // ✅ NEW green = profit
  lossCard:      { backgroundColor: "#FFEBEE" },  // ✅ NEW red = loss

  button: {
    backgroundColor: "#07810d",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  buttonDisabled: { backgroundColor: "#aaa" },

  secondaryButton: {
    backgroundColor: "#3b3e0d",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  // ✅ NEW
  expenseButton: {
    backgroundColor: "#C62828",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

});