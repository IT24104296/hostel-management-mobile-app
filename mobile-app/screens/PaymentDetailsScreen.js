import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import API_URL from "../services/api";

export default function PaymentDetailsScreen({ route, navigation }) {
  const { studentId } = route.params;

  const [student, setStudent] = useState(null);
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState("all");

  const fetchDetails = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/payments/student/${studentId}?status=${filter}`
      );
      const data = await response.json();
      setStudent(data.student);
      setSummary(data.summary);
      setPayments(data.payments);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [filter]);

  if (!student || !summary) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const renderHistory = ({ item }) => (
    <View style={styles.historyCard}>
      <View style={styles.historyTop}>
        <Text style={styles.amountText}>Rs. {item.amount.toLocaleString()}</Text>
        {item.status === "completed" && (
          <TouchableOpacity
            onPress={() => navigation.navigate("Receipt", { paymentId: item._id })}
          >
            <Text style={styles.receiptText}>Receipt</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text
        style={[
          styles.statusTag,
          item.status === "completed" ? styles.completedTag : styles.pendingTag,
        ]}
      >
        {item.status}
      </Text>

      <Text style={styles.historyLine}>{item.paymentDate}</Text>
      <Text style={styles.historyLine}>
        {item.paymentMethod === "bank transfer" ? "Bank Transfer" : item.paymentMethod}
      </Text>
      <Text style={styles.historyLine}>Received by: {item.receivedBy || "-"}</Text>
      <Text style={styles.noteText}>{item.notes || "-"}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#444" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Management</Text>
      </View>

      <View style={styles.profileCard}>
        <Text style={styles.name}>{student.name}</Text>
        <Text style={styles.subText}>
          Room {student.roomNumber}   {student.studentId}
        </Text>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryBox, styles.paidBox]}>
            <Text style={styles.smallText}>Total Paid</Text>
            <Text style={styles.summaryAmount}>Rs. {summary.totalPaid.toLocaleString()}</Text>
          </View>

          <View style={[styles.summaryBox, styles.dueBox]}>
            <Text style={styles.smallText}>Total Due</Text>
            <Text style={[styles.summaryAmount, { color: "#d62828" }]}>
              Rs. {summary.totalDue.toLocaleString()}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.recordButton}
          onPress={() =>
            navigation.navigate("NewPayment", {
              student,
            })
          }
        >
          <Text style={styles.recordButtonText}>Record New Payment</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === "all" && styles.activeFilter]}
          onPress={() => setFilter("all")}
        >
          <Text style={filter === "all" ? styles.activeText : styles.filterText}>All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filter === "completed" && styles.activeFilter]}
          onPress={() => setFilter("completed")}
        >
          <Text style={filter === "completed" ? styles.activeText : styles.filterText}>
            Completed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filter === "pending" && styles.activeFilter]}
          onPress={() => setFilter("pending")}
        >
          <Text style={filter === "pending" ? styles.activeText : styles.filterText}>
            Pending
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.historyTitle}>Payment History ({payments.length})</Text>

      <FlatList
        data={payments}
        keyExtractor={(item) => item._id}
        renderItem={renderHistory}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: {
    flex: 1,
    backgroundColor: "#dff1ec",
    paddingTop: 55,
    paddingHorizontal: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    marginLeft: 16,
    fontWeight: "600",
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginTop: 18,
    elevation: 3,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  subText: {
    textAlign: "center",
    color: "#666",
    marginTop: 6,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  summaryBox: {
    width: "48%",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  paidBox: {
    backgroundColor: "#d8f3dc",
    borderColor: "#66bb6a",
  },
  dueBox: {
    backgroundColor: "#fff",
    borderColor: "#e57373",
  },
  smallText: {
    fontSize: 13,
    color: "#555",
  },
  summaryAmount: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 6,
  },
  recordButton: {
    marginTop: 18,
    backgroundColor: "#53a68f",
    paddingVertical: 13,
    borderRadius: 10,
  },
  recordButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },
  filterRow: {
    flexDirection: "row",
    marginTop: 18,
  },
  filterBtn: {
    backgroundColor: "#e7e7e7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: "#7fc7a8",
  },
  filterText: {
    color: "#555",
  },
  activeText: {
    color: "#fff",
    fontWeight: "600",
  },
  historyTitle: {
    marginTop: 14,
    marginBottom: 10,
    color: "#555",
  },
  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },
  historyTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  amountText: {
    fontWeight: "700",
    fontSize: 18,
  },
  receiptText: {
    color: "#4f46e5",
    fontWeight: "700",
  },
  statusTag: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: "hidden",
    fontSize: 12,
  },
  completedTag: {
    backgroundColor: "#d8f3dc",
    color: "#2a9d55",
  },
  pendingTag: {
    backgroundColor: "#ffe8cc",
    color: "#ff8c00",
  },
  historyLine: {
    marginTop: 8,
    color: "#555",
  },
  noteText: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 10,
    fontStyle: "italic",
    color: "#666",
  },
});