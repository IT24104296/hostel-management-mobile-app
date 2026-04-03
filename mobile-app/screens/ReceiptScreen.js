import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import API_URL from "../services/api";

export default function ReceiptScreen({ route, navigation }) {
  const { paymentId } = route.params;
  const [payment, setPayment] = useState(null);
  const [student, setStudent] = useState(null);

  const fetchReceipt = async () => {
    try {
      const response = await fetch(`${API_URL}/api/payments/receipt/${paymentId}`);
      const data = await response.json();
      setPayment(data.payment);
      setStudent(data.student);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchReceipt();
  }, []);

  if (!payment || !student) {
    return (
      <View style={styles.center}>
        <Text>Loading receipt...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.topTitle}>Payment Receipt</Text>

      <View style={styles.successIcon}>
        <Ionicons name="checkmark-circle" size={70} color="#63c174" />
      </View>

      <Text style={styles.successText}>Payment Successful</Text>
      <Text style={styles.hostelName}>Girls’ Hostel</Text>
      <Text style={styles.subText}>Payment Management System</Text>
      <Text style={styles.subText}>Malabe</Text>

      <View style={styles.separator} />

      <Text style={styles.receiptTitle}>PAYMENT RECEIPT</Text>
      <Text style={styles.receiptNo}>Receipt No: {payment.receiptNo}</Text>

      <View style={styles.amountBox}>
        <Text style={styles.amountLabel}>Amount Paid</Text>
        <Text style={styles.amountValue}>Rs. {payment.amount.toLocaleString()}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Student Details</Text>
        <Text>Name: {student.name}</Text>
        <Text>Registration No: {student.studentId}</Text>
        <Text>Room Number: {student.roomNumber}</Text>
        <Text>Phone: {student.phone || "-"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Payment Information</Text>
        <Text>Payment Date: {payment.paymentDate}</Text>
        <Text>Payment Method: {payment.paymentMethod}</Text>
        <Text>Received By: {payment.receivedBy}</Text>
        <Text>Status: {payment.status}</Text>
        <Text>Notes: {payment.notes || "-"}</Text>
      </View>

      <Text style={styles.footerText}>
        This is a computer-generated receipt and does not require a signature.
      </Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => Alert.alert("Info", "Share button UI is ready")}
        >
          <Text style={styles.secondaryText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate("PaymentList")}
        >
          <Text style={styles.primaryText}>Done</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: {
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 45,
  },
  topTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  successIcon: {
    alignItems: "center",
    marginTop: 20,
  },
  successText: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 10,
  },
  hostelName: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 8,
  },
  subText: {
    textAlign: "center",
    color: "#777",
    marginTop: 3,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginVertical: 20,
  },
  receiptTitle: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
  },
  receiptNo: {
    textAlign: "center",
    color: "#777",
    marginTop: 6,
  },
  amountBox: {
    backgroundColor: "#d8f3dc",
    borderWidth: 1,
    borderColor: "#8fd19e",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    alignItems: "center",
  },
  amountLabel: {
    color: "#388e3c",
  },
  amountValue: {
    fontSize: 30,
    fontWeight: "700",
    color: "#2e7d32",
    marginTop: 6,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  footerText: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  secondaryBtn: {
    width: "45%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 14,
    borderRadius: 10,
  },
  primaryBtn: {
    width: "50%",
    backgroundColor: "#53a68f",
    paddingVertical: 14,
    borderRadius: 10,
  },
  secondaryText: {
    textAlign: "center",
    fontWeight: "700",
    color: "#444",
  },
  primaryText: {
    textAlign: "center",
    fontWeight: "700",
    color: "#fff",
  },
});