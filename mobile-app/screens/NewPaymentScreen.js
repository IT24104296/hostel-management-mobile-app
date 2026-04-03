import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import API_URL from "../services/api";

export default function NewPaymentScreen({ route, navigation }) {
  const { studentId, roomNumber } = route.params;

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentDate, setPaymentDate] = useState("");
  const [notes, setNotes] = useState("");
  const [paidMonth, setPaidMonth] = useState("");

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const generateReceiptNo = () => {
    return "FTXN" + Date.now();
  };

  const recordPayment = async () => {
    const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;

    if (!amount || !paymentMethod || !paymentDate || !paidMonth) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    if (wordCount > 100) {
      Alert.alert("Error", "Notes cannot exceed 100 words");
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
          paymentMonth: paidMonth,
          notes,
          status: "completed",
          receiptNo: generateReceiptNo(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.message || "Failed to record payment");
        return;
      }

      Alert.alert("Success", "Payment recorded successfully", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.log("Error adding payment:", error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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

      <Text style={styles.label}>Paid Month *</Text>
      <View style={styles.monthGrid}>
        {months.map((month) => (
          <TouchableOpacity
            key={month}
            style={[
              styles.monthBox,
              paidMonth === month && styles.activeMethod,
            ]}
            onPress={() => setPaidMonth(month)}
          >
            <Text style={styles.monthText}>{month}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Payment Date *</Text>
      <TextInput
        style={styles.input}
        placeholder="yyyy-mm-dd"
        value={paymentDate}
        onChangeText={setPaymentDate}
      />

      <Text style={styles.label}>Notes (Max 100 words)</Text>
      <TextInput
        style={[styles.input, styles.notesInput]}
        placeholder="Enter notes here"
        value={notes}
        onChangeText={setNotes}
        multiline
      />
      <Text style={styles.wordCount}>
        {notes.trim() ? notes.trim().split(/\s+/).length : 0}/100 words
      </Text>

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 55,
    paddingHorizontal: 18,
    paddingBottom: 30,
    backgroundColor: "#dff1ec",
    flexGrow: 1,
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
  notesInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  wordCount: {
    marginTop: 6,
    color: "#666",
    fontSize: 12,
    textAlign: "right",
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
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  monthBox: {
    width: "31%",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  monthText: {
    fontSize: 13,
    fontWeight: "500",
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