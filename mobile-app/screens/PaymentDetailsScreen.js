import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
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

  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState("all");

  const fetchDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/api/payments`);
      const data = await response.json();

      const studentPayments = data.filter((item) => {
        if (item.studentId !== studentId) return false;

        if (filter === "all") return true;

        const itemStatus = (item.status || "").toLowerCase();

        if (filter === "paid") {
          return itemStatus === "paid" || itemStatus === "completed";
        }

        return itemStatus === filter;
      });

      setPayments(studentPayments);
    } catch (error) {
      console.log("Error fetching payment details:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDetails();
    }, [filter])
  );

  const totalPaid = payments
    .filter((item) => {
      const status = (item.status || "").toLowerCase();
      return status === "completed" || status === "paid";
    })
    .reduce((sum, item) => sum + (item.amount || 0), 0);

  const totalDue = payments
  .filter((item) => {
    const status = (item.status || "").toLowerCase();
    return status === "pending" || status === "due";
  })
  .reduce((sum, item) => sum + (item.amount || 0), 0);

  const firstPayment = payments[0];

  const renderHistory = ({ item }) => {
    const itemStatus = (item.status || "").toLowerCase();
    const isPaid = itemStatus === "paid" || itemStatus === "completed";

    return (
      <View style={styles.historyCard}>
        <View style={styles.historyTop}>
          <Text style={styles.amountText}>Rs. {item.amount || 0}</Text>

          {isPaid && (
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
            isPaid ? styles.completedTag : styles.pendingTag,
          ]}
        >
          {item.status || "unknown"}
        </Text>

        <Text style={styles.historyLine}>Date: {item.paymentDate || "-"}</Text>
        <Text style={styles.historyLine}>Method: {item.paymentMethod || "-"}</Text>
        <Text style={styles.historyLine}>Month: {item.paymentMonth || "-"}</Text>
        <Text style={styles.noteText}>Room: {item.roomNumber || "-"}</Text>
      </View>
    );
  };

  if (!firstPayment) {
    return (
      <View style={styles.center}>
        <Text>No payment details found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#444" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Management</Text>
      </View>

      <View style={styles.profileCard}>
        <Text style={styles.name}>{firstPayment.studentId}</Text>
        <Text style={styles.subText}>Room {firstPayment.roomNumber}</Text>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryBox, styles.paidBox]}>
            <Text style={styles.smallText}>Total Paid</Text>
            <Text style={styles.summaryAmount}>Rs. {totalPaid}</Text>
          </View>

          <View style={[styles.summaryBox, styles.dueBox]}>
            <Text style={styles.smallText}>Total Due</Text>
            <Text style={[styles.summaryAmount, { color: "#d62828" }]}>
              Rs. {totalDue}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.recordButton}
          onPress={() => {
            if (!firstPayment) {
              return;
            }

            navigation.navigate("NewPayment", {
              studentId: firstPayment.studentId,
              roomNumber: firstPayment.roomNumber,
            });
          }}
        >
          <Text style={styles.recordButtonText}>Record New Payment</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === "all" && styles.activeFilter]}
          onPress={() => setFilter("all")}
        >
          <Text style={filter === "all" ? styles.activeText : styles.filterText}>
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filter === "paid" && styles.activeFilter]}
          onPress={() => setFilter("paid")}
        >
          <Text style={filter === "paid" ? styles.activeText : styles.filterText}>
            Paid
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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
    alignItems: "center",
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