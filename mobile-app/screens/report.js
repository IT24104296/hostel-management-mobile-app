// ═══════════════════════════════════════════════════════════════════
//  mobile-app/screens/report.js  —  UPDATED
//
//  CHANGES FROM PREVIOUS VERSION:
//  1. Added "Expense Breakdown" section showing expenses grouped
//     by category — fetched from GET /api/expenses with date filter
//  2. Added Net Balance card (income - expenses)
//  3. PDF updated to include expense breakdown table and net balance
//  4. FIXED savePDF — now actually saves to device Downloads folder
//     using StorageAccessFramework (Android) / Sharing (iOS)
//
//  All previous features preserved:
//  • Bug 3 fix — uses route.params.report directly
//  • Payment method breakdown
//  • PieChart, BarChart, Monthly trend LineChart
//  • Share PDF, Save PDF to Downloads
// ═══════════════════════════════════════════════════════════════════

import React, { useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  View,
  ActivityIndicator,
  Platform,
} from "react-native";
import { PieChart, BarChart, LineChart } from "react-native-chart-kit";
import * as Print      from "expo-print";
import * as Sharing    from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

const screenWidth = Dimensions.get("window").width;

const MONTH_NAMES = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Category colours for expense breakdown badges
const CATEGORY_COLORS = {
  "Electricity":  { bg: "#FFF3E0", text: "#E65100" },
  "Water":        { bg: "#E3F2FD", text: "#0D47A1" },
  "Internet":     { bg: "#EDE7F6", text: "#4527A0" },
  "Maintenance":  { bg: "#FCE4EC", text: "#880E4F" },
  "Cleaning":     { bg: "#E8F5E9", text: "#1B5E20" },
  "Staff Salary": { bg: "#E0F7FA", text: "#006064" },
  "Other":        { bg: "#F5F5F5", text: "#424242" },
};

export default function ReportScreen({ route }) {

  // Main report data from ReportList (already has all income fields)
  const { report } = route.params;

  // ── Monthly trend state ───────────────────────────────────────
  const [monthlyData,    setMonthlyData]    = useState(null);
  const [monthlyLoading, setMonthlyLoading] = useState(true);
  const [monthlyError,   setMonthlyError]   = useState(null);

  // Expense breakdown state
  const [expenses,        setExpenses]        = useState([]);
  const [expenseLoading,  setExpenseLoading]  = useState(true);
  const [expenseError,    setExpenseError]    = useState(null);

  // ── Fetch monthly trend ───────────────────────────────────────
  useEffect(() => {
    fetch("http://10.0.2.2:5000/api/financial/monthly")
      .then(res => res.json())
      .then(data => {
        const fullYear = Array(12).fill(0);
        data.forEach(item => {
          const month = Number(item?._id);
          if (Number.isInteger(month) && month >= 1 && month <= 12) {
            fullYear[month - 1] = Number(item.total) || 0;
          }
        });
        setMonthlyData(fullYear);
        setMonthlyLoading(false);
      })
      .catch(err => {
        console.log("Monthly fetch error:", err);
        setMonthlyError("Failed to load monthly trend.");
        setMonthlyLoading(false);
      });
  }, []);

  // Fetch expenses for this report's date range
  useEffect(() => {
    const start = new Date(report.startDate).toISOString().split("T")[0];
    const end   = new Date(report.endDate).toISOString().split("T")[0];

    fetch(`http://10.0.2.2:5000/api/expenses?start=${start}&end=${end}`)
      .then(res => res.json())
      .then(data => {
        setExpenses(data.expenses || []);
        setExpenseLoading(false);
      })
      .catch(err => {
        console.log("Expense fetch error:", err);
        setExpenseError("Failed to load expense breakdown.");
        setExpenseLoading(false);
      });
  }, []);

  // Group expenses by category
  const expenseByCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  // ── Chart data ────────────────────────────────────────────────
  const pieData = [
    { name: "Collected", amount: report.collected, color: "#4CAF50", legendFontColor: "#333", legendFontSize: 14 },
    { name: "Pending",   amount: report.pending,   color: "#F44336", legendFontColor: "#333", legendFontSize: 14 },
  ];

  const barData = {
    labels:   ["Total", "Collected", "Pending"],
    datasets: [{ data: [report.totalIncome, report.collected, report.pending] }],
  };

  const monthlyChartData = monthlyData
    ? {
        labels:   MONTH_NAMES.slice(1),
        datasets: [{ data: monthlyData, color: (opacity = 1) => `rgba(21,101,192,${opacity})`, strokeWidth: 2 }],
      }
    : null;

  // ── HTML for PDF ──────────────────────────────────────────────
  const getReportHTML = () => `
    <html>
      <head>
        <style>
          body         { font-family: Arial, sans-serif; padding: 30px; color: #222; }
          h1           { color: #2E7D32; margin-bottom: 4px; }
          h2           { color: #1565C0; margin-top: 28px; margin-bottom: 8px; }
          p            { font-size: 16px; margin: 8px 0; }
          .period      { font-size: 14px; color: #777; margin-bottom: 20px; }
          hr           { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
          table        { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th           { background: #1565C0; color: #fff; padding: 8px 12px; text-align: left; }
          td           { padding: 8px 12px; border-bottom: 1px solid #eee; }
          tr:nth-child(even) td { background: #f9f9f9; }
          .method-box  { display: inline-block; width: 30%; padding: 12px; border-radius: 8px; background: #f5f5f5; text-align: center; margin-right: 2%; }
          .method-label  { font-size: 13px; color: #777; }
          .method-amount { font-size: 18px; font-weight: bold; color: #333; }
          .net-positive  { color: #2E7D32; font-size: 22px; font-weight: bold; }
          .net-negative  { color: #C62828; font-size: 22px; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Hostel Financial Report</h1>
        <p class="period">
          Period: ${new Date(report.startDate).toLocaleDateString()}
          &ndash;
          ${new Date(report.endDate).toLocaleDateString()}
        </p>

        <hr/>
        <h2>Income Summary</h2>
        <p><strong>Total Expected Income:</strong> Rs ${report.totalIncome}</p>
        <p><strong>Collected:</strong>             Rs ${report.collected}</p>
        <p><strong>Pending:</strong>               Rs ${report.pending}</p>

        <hr/>
        <h2>Payment Method Breakdown</h2>
        <div>
          <div class="method-box"><div class="method-label">Cash</div><div class="method-amount">Rs ${report.cash}</div></div>
          <div class="method-box"><div class="method-label">Bank Transfer</div><div class="method-amount">Rs ${report.bank}</div></div>
          <div class="method-box"><div class="method-label">Key Money</div><div class="method-amount">Rs ${report.keyMoney}</div></div>
        </div>

        <hr/>
        <h2>Expense Breakdown</h2>
        <table>
          <thead><tr><th>Category</th><th>Total (Rs)</th></tr></thead>
          <tbody>
            ${Object.entries(expenseByCategory).length > 0
              ? Object.entries(expenseByCategory)
                  .map(([cat, amt]) => `<tr><td>${cat}</td><td>Rs ${amt}</td></tr>`)
                  .join("")
              : "<tr><td colspan='2'>No expenses in this period</td></tr>"
            }
            <tr><td><strong>Total Expenses</strong></td><td><strong>Rs ${report.totalExpenses || 0}</strong></td></tr>
          </tbody>
        </table>

        <hr/>
        <h2>Net Balance</h2>
        <p class="${(report.netBalance || 0) >= 0 ? "net-positive" : "net-negative"}">
          Rs ${report.netBalance || 0}
          &nbsp; (${(report.netBalance || 0) >= 0 ? "Profit" : "Loss"})
        </p>

        <hr/>
        <h2>Monthly Earnings Trend</h2>
        <table>
          <thead><tr><th>Month</th><th>Total Earnings (Rs)</th></tr></thead>
          <tbody>
            ${monthlyData
              ? monthlyData.map((total, i) =>
                  `<tr><td>${MONTH_NAMES[i + 1]}</td><td>${total > 0 ? "Rs " + total : "—"}</td></tr>`
                ).join("")
              : "<tr><td colspan='2'>Monthly data unavailable</td></tr>"
            }
          </tbody>
        </table>
      </body>
    </html>
  `;

  // ── Share PDF ─────────────────────────────────────────────────
  const sharePDF = async () => {
    try {
      const { uri } = await Print.printToFileAsync({ html: getReportHTML() });
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Not Available", "Sharing is not supported on this device.");
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Share Financial Report",
        UTI: "com.adobe.pdf",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share the PDF.");
    }
  };

  // ── Save PDF to Downloads ─────────────────────────────────────
  // ✅ FIXED: Uses StorageAccessFramework on Android to write
  //    directly into the real Downloads folder.
  //    On iOS, falls back to the share sheet (standard behaviour).
const savePDF = async () => {
  try {
    const { uri: tempUri } = await Print.printToFileAsync({ html: getReportHTML() });
    const fileName = `FinancialReport_${Date.now()}.pdf`;

    if (Platform.OS === "android") {
      // Guard: SAF may be undefined on older expo-file-system versions
      const SAF = FileSystem.StorageAccessFramework;
      if (!SAF || typeof SAF.requestDirectoryPermissionsAsync !== "function") {
        Alert.alert(
          "Unsupported Environment",
          "Saving directly to Downloads requires a development build. In Expo Go, use Share PDF instead."
        );
        return;
      }

      const permissions = await SAF.requestDirectoryPermissionsAsync();

      if (!permissions.granted) {
        Alert.alert("Permission Denied", "Storage permission is required to save the PDF.");
        return;
      }

      const destUri = await SAF.createFileAsync(
        permissions.directoryUri,
        fileName,
        "application/pdf"
      );

      const base64 = await FileSystem.readAsStringAsync(tempUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await FileSystem.writeAsStringAsync(destUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      Alert.alert("Saved!", `"${fileName}" was saved to the selected folder.`);

    } else {
      // iOS
      const destUri = FileSystem.documentDirectory + fileName;
      await FileSystem.copyAsync({ from: tempUri, to: destUri });

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Saved!", `Report saved to:\n${destUri}`);
        return;
      }
      await Sharing.shareAsync(destUri, {
        mimeType: "application/pdf",
        dialogTitle: "Save Financial Report",
        UTI: "com.adobe.pdf",
      });
    }
  } catch (error) {
    console.error("Save error:", error);
    Alert.alert("Error", "Failed to save the PDF: " + error.message);
  }
};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

      <Text style={styles.title}>Detailed Report</Text>

      {/* ── DATE RANGE ──────────────────────────────────────────── */}
      <View style={styles.dateRow}>
        <Text style={styles.dateText}>From: {new Date(report.startDate).toLocaleDateString()}</Text>
        <Text style={styles.dateText}>To: {new Date(report.endDate).toLocaleDateString()}</Text>
      </View>

      {/* ── INCOME SUMMARY CARDS ────────────────────────────────── */}
      <View style={[styles.card, styles.totalCard]}>
        <Text style={styles.cardLabel}>Total Expected Income</Text>
        <Text style={styles.cardAmount}>Rs {report.totalIncome}</Text>
      </View>
      <View style={[styles.card, styles.collectedCard]}>
        <Text style={styles.cardLabel}>Collected</Text>
        <Text style={styles.cardAmount}>Rs {report.collected}</Text>
      </View>
      <View style={[styles.card, styles.pendingCard]}>
        <Text style={styles.cardLabel}>Pending</Text>
        <Text style={styles.cardAmount}>Rs {report.pending}</Text>
      </View>

      {/* ── PAYMENT METHOD BREAKDOWN ─────────────────────────────── */}
      <Text style={styles.sectionTitle}>Payment Method Breakdown</Text>
      <View style={styles.methodRow}>
        <View style={styles.methodBox}><Text style={styles.methodLabel}>Cash</Text><Text style={styles.methodAmount}>Rs {report.cash}</Text></View>
        <View style={styles.methodBox}><Text style={styles.methodLabel}>Bank Transfer</Text><Text style={styles.methodAmount}>Rs {report.bank}</Text></View>
        <View style={styles.methodBox}><Text style={styles.methodLabel}>Key Money</Text><Text style={styles.methodAmount}>Rs {report.keyMoney}</Text></View>
      </View>

      {/* ── EXPENSE BREAKDOWN SECTION ────────────────────────────── */}
      <Text style={styles.sectionTitle}>Expense Breakdown</Text>

      {expenseLoading && (
        <View style={styles.chartPlaceholder}>
          <ActivityIndicator size="small" color="#C62828" />
          <Text style={styles.placeholderText}>Loading expenses...</Text>
        </View>
      )}

      {expenseError && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{expenseError}</Text>
        </View>
      )}

      {!expenseLoading && !expenseError && (
        <>
          {/* Total expenses card */}
          <View style={[styles.card, styles.expenseCard]}>
            <Text style={styles.cardLabel}>Total Expenses</Text>
            <Text style={styles.cardAmount}>Rs {report.totalExpenses || 0}</Text>
          </View>

          {/* Per-category breakdown */}
          {Object.entries(expenseByCategory).length > 0
            ? Object.entries(expenseByCategory).map(([cat, amt]) => {
                const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS["Other"];
                return (
                  <View key={cat} style={styles.categoryRow}>
                    <View style={[styles.categoryBadge, { backgroundColor: colors.bg }]}>
                      <Text style={[styles.categoryBadgeText, { color: colors.text }]}>{cat}</Text>
                    </View>
                    <Text style={styles.categoryAmt}>Rs {amt}</Text>
                  </View>
                );
              })
            : <Text style={styles.noExpenseText}>No expenses in this period.</Text>
          }
        </>
      )}

      {/* ── NET BALANCE CARD ─────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Net Balance</Text>
      <View style={[
        styles.card,
        (report.netBalance || 0) >= 0 ? styles.profitCard : styles.lossCard
      ]}>
        <Text style={styles.cardLabel}>
          {(report.netBalance || 0) >= 0 ? "Profit" : "Loss"} for this period
        </Text>
        <Text style={styles.netAmount}>Rs {report.netBalance || 0}</Text>
        <Text style={styles.netFormula}>
          Income Rs {report.totalIncome} — Expenses Rs {report.totalExpenses || 0}
        </Text>
      </View>

      {/* ── PIE CHART ───────────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Income Distribution</Text>
      <PieChart data={pieData} width={screenWidth - 40} height={220} chartConfig={chartConfig} accessor={"amount"} backgroundColor={"transparent"} paddingLeft={"10"} />

      {/* ── BAR CHART ───────────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Income Comparison</Text>
      <BarChart data={barData} width={screenWidth - 40} height={220} chartConfig={chartConfig} verticalLabelRotation={0} />

      {/* ── MONTHLY LINE CHART ──────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Monthly Earnings Trend</Text>
      {monthlyLoading && (
        <View style={styles.chartPlaceholder}>
          <ActivityIndicator size="large" color="#1565C0" />
          <Text style={styles.placeholderText}>Loading monthly data...</Text>
        </View>
      )}
      {monthlyError && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{monthlyError}</Text>
        </View>
      )}
      {monthlyChartData && (
        <>
          <Text style={styles.chartNote}>All-time monthly earnings across the year (Rs)</Text>
          <LineChart
            data={monthlyChartData}
            width={screenWidth - 40}
            height={240}
            chartConfig={monthlyChartConfig}
            bezier
            withDots
            withVerticalLines
            withHorizontalLines
            style={styles.lineChart}
          />
        </>
      )}

      {/* ── ACTION BUTTONS ──────────────────────────────────────── */}
      <TouchableOpacity style={styles.button} onPress={sharePDF}>
        <Text style={styles.buttonText}>Share PDF</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={savePDF}>
        <Text style={styles.buttonText}>Save PDF to Downloads</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#fff", backgroundGradientTo: "#fff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(46,125,50,${opacity})`,
  labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
};

const monthlyChartConfig = {
  backgroundGradientFrom: "#EFF6FF", backgroundGradientTo: "#EFF6FF",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(21,101,192,${opacity})`,
  labelColor: (opacity = 1) => `rgba(33,33,33,${opacity})`,
  propsForDots: { r: "4", strokeWidth: "2", stroke: "#1565C0" },
};

const styles = StyleSheet.create({
  container:     { flex: 1, padding: 20, backgroundColor: "#F5F6FA" },
  contentContainer: { paddingBottom: 40 },
  title:         { fontSize: 26, fontWeight: "bold", marginBottom: 16, color: "#333" },
  dateRow:       { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  dateText:      { fontSize: 13, color: "#555" },
  card:          { padding: 20, borderRadius: 14, marginBottom: 12, elevation: 3 },
  totalCard:     { backgroundColor: "#E8F5E9" },
  collectedCard: { backgroundColor: "#E3F2FD" },
  pendingCard:   { backgroundColor: "#FFF3E0" },
  expenseCard:   { backgroundColor: "#FCE4EC" },
  profitCard:    { backgroundColor: "#E8F5E9" },
  lossCard:      { backgroundColor: "#FFEBEE" },
  cardLabel:     { fontSize: 14, color: "#555", marginBottom: 6 },
  cardAmount:    { fontSize: 22, fontWeight: "bold", color: "#333" },
  netAmount:     { fontSize: 26, fontWeight: "bold", color: "#333", marginBottom: 4 },
  netFormula:    { fontSize: 12, color: "#777" },
  sectionTitle:  { fontSize: 18, fontWeight: "bold", marginTop: 24, marginBottom: 12, color: "#333" },
  methodRow:     { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  methodBox:     { backgroundColor: "#fff", padding: 14, borderRadius: 12, elevation: 2, width: "31%" },
  methodLabel:   { fontSize: 11, color: "#777", marginBottom: 4 },
  methodAmount:  { fontSize: 14, fontWeight: "bold", color: "#333" },
  categoryRow:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", padding: 12, borderRadius: 10, marginBottom: 8, elevation: 2 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  categoryBadgeText: { fontSize: 13, fontWeight: "bold" },
  categoryAmt:   { fontSize: 15, fontWeight: "bold", color: "#333" },
  noExpenseText: { fontSize: 14, color: "#888", textAlign: "center", marginBottom: 12 },
  chartPlaceholder: { height: 80, justifyContent: "center", alignItems: "center", backgroundColor: "#f9f9f9", borderRadius: 12, marginBottom: 8 },
  placeholderText: { marginTop: 8, fontSize: 13, color: "#777" },
  errorBox:      { backgroundColor: "#FFEBEE", padding: 14, borderRadius: 10, marginBottom: 12 },
  errorText:     { color: "#C62828", fontSize: 13, textAlign: "center" },
  chartNote:     { fontSize: 12, color: "#888", marginBottom: 8, fontStyle: "italic" },
  lineChart:     { borderRadius: 12, marginBottom: 8 },
  button:        { marginTop: 16, backgroundColor: "#2E7D32", padding: 18, borderRadius: 12, alignItems: "center" },
  saveButton:    { backgroundColor: "#1565C0" },
  buttonText:    { color: "#fff", fontSize: 16, fontWeight: "bold" },
});