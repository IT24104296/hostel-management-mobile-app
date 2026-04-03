import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import API_URL from "../services/api";

export default function NewPaymentScreen({ route, navigation }) {
  const { studentId, roomNumber } = route.params;

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentDate, setPaymentDate] = useState("");
  const [status, setStatus] = useState("completed");

  const generateReceiptNo = () => {
    return "FTXN" + Date.now();
  };

  const recordPayment = async () => {
    if (!amount || !paymentMethod || !paymentDate || !status) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          studentName: studentId,
          roomNumber,
          amount: Number(amount),
          paymentMethod,
          paymentDate,
          paymentMonth: paymentDate.slice(0, 7),
          status,
          receiptNo: generateReceiptNo(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.message || "Failed to record payment");
        return;
      }

      Alert.alert("Success", "Payment recorded successfully");

      navigation.goBack();
    } catch (error) {
      console.log("Error adding payment:", error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#444" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Payment</Text>
      </View>

      <View style={styles.studentCard}>
        <Text style={styles.studentName}>{studentId}</Text>
        <Text style={styles.studentSub}>Room {roomNumber}</Text>
      </View>

      <Text style={styles.label}>Payment Amount *</Text>
      <TextInput
        style={styles.input}
        placeholder="Rs. 0"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Payment Method *</Text>

      <View style={styles.methodRow}>
        <TouchableOpacity
          style={[
            styles.methodBox,
            paymentMethod === "cash" && styles.activeMethod,
          ]}
          onPress={() => setPaymentMethod("cash")}
        >
          <Ionicons name="wallet-outline" size={26} color="#333" />
          <Text style={styles.methodText}>Cash</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.methodBox,
            paymentMethod === "bank transfer" && styles.activeMethod,
          ]}
          onPress={() => setPaymentMethod("bank transfer")}
        >
          <Ionicons name="card-outline" size={26} color="#333" />
          <Text style={styles.methodText}>Bank Transfer</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Payment Status *</Text>

      <View style={styles.methodRow}>
        <TouchableOpacity
          style={[
            styles.methodBox,
            status === "completed" && styles.activeMethod,
          ]}
          onPress={() => setStatus("completed")}
        >
          <Ionicons name="checkmark-circle-outline" size={26} color="#333" />
          <Text style={styles.methodText}>Completed</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.methodBox,
            status === "pending" && styles.activeMethod,
          ]}
          onPress={() => setStatus("pending")}
        >
          <Ionicons name="time-outline" size={26} color="#333" />
          <Text style={styles.methodText}>Pending</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Payment Date *</Text>
      <TextInput
        style={styles.input}
        placeholder="yyyy-mm-dd"
        value={paymentDate}
        onChangeText={setPaymentDate}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={recordPayment}>
          <Text style={styles.saveText}>Record Payment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  studentCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
    elevation: 2,
  },
  studentName: {
    fontSize: 22,
    fontWeight: "700",
  },
  studentSub: {
    color: "#666",
    marginTop: 5,
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "600",
    color: "#444",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  methodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  methodBox: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  activeMethod: {
    borderColor: "#53a68f",
    backgroundColor: "#ecf9f3",
  },
  methodText: {
    marginTop: 8,
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  cancelBtn: {
    width: "45%",
    backgroundColor: "#fff",
    paddingVertical: 13,
    borderRadius: 10,
  },
  saveBtn: {
    width: "50%",
    backgroundColor: "#53a68f",
    paddingVertical: 13,
    borderRadius: 10,
  },
  cancelText: {
    textAlign: "center",
    fontWeight: "700",
    color: "#444",
  },
  saveText: {
    textAlign: "center",
    fontWeight: "700",
    color: "#fff",
  },
});