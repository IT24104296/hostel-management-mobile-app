import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import api from "../../services/api";

export default function FinancialScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  const [summary, setSummary] = useState({
    totalIncome: 0,
    collected: 0,
    pending: 0,
  });

  const [totalExpenses, setTotalExpenses] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);

  const [startDate, setStartDate] = useState(startOfYear);
  const [endDate, setEndDate] = useState(today);
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  // Fetch financial data
  useEffect(() => {
    const fetchFinancialData = async () => {
      const start = startDate.toISOString().split("T")[0];
      const end = endDate.toISOString().split("T")[0];

      setLoading(true);
      setError(null);

      try {
        const [summaryRes, expenseRes] = await Promise.all([
          api.get(`/api/financial/summary?start=${start}&end=${end}`),
          api.get(`/api/expenses?start=${start}&end=${end}`),
        ]);

        const summaryData = summaryRes.data || summaryRes;
        const expenseData = expenseRes.data || expenseRes;

        setSummary({
          totalIncome: summaryData.totalIncome || summaryData.expectedIncome || 0,
          collected: summaryData.collected || 0,
          pending: summaryData.pending || 0,
        });

        setTotalExpenses(expenseData.totalAmount || expenseData.total || 0);
      } catch (err) {
        console.error("Financial data fetch failed:", err);
        setError("Failed to load financial data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [startDate, endDate]);

  const netBalance = summary.totalIncome - totalExpenses;

  const generateReport = async () => {
    if (endDate < startDate) {
      Alert.alert("Invalid Date", "End date cannot be before start date.");
      return;
    }

    try {
      setGenerating(true);
      const start = startDate.toISOString().split("T")[0];
      const end = endDate.toISOString().split("T")[0];

      await api.post("/api/financial/report", { start, end });

      Alert.alert("Success", "Report generated successfully!");
      navigation.navigate("Reports");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to generate report.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <LinearGradient
      colors={["#F4FBF8", "#BFE5DB"]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Financial Reports</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Date Range */}
        <View style={styles.dateContainer}>
          <TouchableOpacity style={styles.dateBox} onPress={() => setShowStart(true)}>
            <Text style={styles.dateLabel}>Start Date</Text>
            <Text style={styles.dateValue}>{startDate.toDateString()}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dateBox} onPress={() => setShowEnd(true)}>
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

        <Text style={styles.title}>Financial Summary</Text>

        {loading && <ActivityIndicator size="large" color="#58A895" style={{ marginVertical: 30 }} />}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

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

            <View style={[styles.card, styles.expenseCard]}>
              <Text style={styles.cardTitle}>Total Expenses</Text>
              <Text style={styles.amount}>Rs {totalExpenses}</Text>
            </View>

            <View style={[styles.card, netBalance >= 0 ? styles.profitCard : styles.lossCard]}>
              <Text style={styles.cardTitle}>Net Balance</Text>
              <Text style={styles.amount}>Rs {netBalance}</Text>
              <Text style={styles.balanceNote}>
                {netBalance >= 0 ? "Profit" : "Loss"}
              </Text>
            </View>
          </>
        )}

        <TouchableOpacity
          style={[styles.button, generating && styles.buttonDisabled]}
          onPress={generateReport}
          disabled={generating}
        >
          <Text style={styles.buttonText}>
            {generating ? "Generating Report..." : "Generate Report"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("Reports")}
        >
          <Text style={styles.buttonText}>View Saved Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.expenseButton}
          onPress={() => navigation.navigate("Expenses")}
        >
          <Text style={styles.buttonText}>Manage Expenses</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 6, marginRight: 12 },
  screenTitle: { fontSize: 24, fontWeight: "700", color: "#111" },

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

  expectedCard: { backgroundColor: "#E8F5E9" },
  collectedCard: { backgroundColor: "#E3F2FD" },
  pendingCard: { backgroundColor: "#FFF3E0" },
  expenseCard: { backgroundColor: "#FCE4EC" },
  profitCard: { backgroundColor: "#E8F5E9" },
  lossCard: { backgroundColor: "#FFEBEE" },

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

  expenseButton: {
    backgroundColor: "#C62828",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});