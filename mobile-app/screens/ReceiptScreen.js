import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import API_URL from "../services/api";

export default function ReceiptScreen({ route, navigation }) {
  const { paymentId } = route.params;

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReceipt = async () => {
    try {
      setLoading(true);

      // using the same payments API flow you already use in other screens
      const response = await fetch(`${API_URL}/api/payments`);
      const data = await response.json();

      const foundPayment = data.find((item) => item._id === paymentId);
      setPayment(foundPayment || null);
    } catch (error) {
      console.log("Error fetching receipt:", error);
      setPayment(null);
    } finally {
      setLoading(false);
    }
  };

  // auto refresh when this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchReceipt();
    }, [paymentId])
  );

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return dateValue;

    return date.toLocaleDateString();
  };

  const formatTime = (dateValue) => {
    if (!dateValue) return "-";

    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "-";

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getReceiptNo = () => {
    if (!payment) return "-";
    return payment.receiptNo || `FTXN${payment._id?.slice(-8) || "00000000"}`;
  };

  const getStudentName = () => {
    if (!payment) return "-";
    return payment.studentName || payment.studentId || "-";
  };

  const getRegistrationNo = () => {
    if (!payment) return "-";
    return payment.studentId || "-";
  };

  const getRoomNumber = () => {
    if (!payment) return "-";
    return payment.roomNumber || "-";
  };

  const getPhone = () => {
    if (!payment) return "-";
    return payment.phone || "+94 77 000 0000";
  };

  const getReceivedBy = () => {
    if (!payment) return "-";
    return payment.receivedBy || "Admin";
  };

  const getStatus = () => {
    if (!payment) return "-";
    const status = (payment.status || "").toLowerCase();

    if (status === "completed" || status === "paid") return "Completed";
    if (status === "pending" || status === "due") return "Pending";

    return payment.status || "-";
  };

  const handleShare = () => {
    Alert.alert("Info", "Share option can be added next");
  };

  const handleDownload = () => {
    Alert.alert("Info", "Download option can be added next");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading receipt...</Text>
      </View>
    );
  }

  if (!payment) {
    return (
      <View style={styles.center}>
        <Text>Receipt not found</Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#222" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Payment Receipt</Text>
      </View>

      <View style={styles.successIconWrap}>
        <View style={styles.successCircle}>
          <Ionicons name="checkmark" size={34} color="#2f9e59" />
        </View>
      </View>

      <Text style={styles.successText}>Payment Successful</Text>
      <Text style={styles.hostelName}>Girls’ Hostel</Text>
      <Text style={styles.subTitle}>Payment Management System</Text>
      <Text style={styles.subTitle}>Wijayaba Place, Malabe</Text>

      <View style={styles.separator} />

      <Text style={styles.receiptTitle}>PAYMENT RECEIPT</Text>
      <Text style={styles.receiptNo}>Receipt No: {getReceiptNo()}</Text>

      <View style={styles.amountBox}>
        <Text style={styles.amountLabel}>Amount Paid</Text>
        <Text style={styles.amountValue}>Rs. {payment.amount || 0}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Student Details</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name:</Text>
          <Text style={styles.infoValue}>{getStudentName()}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Registration No:</Text>
          <Text style={styles.infoValue}>{getRegistrationNo()}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Room Number:</Text>
          <Text style={styles.infoValue}>{getRoomNumber()}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone:</Text>
          <Text style={styles.infoValue}>{getPhone()}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Payment Information</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Payment Date:</Text>
          <Text style={styles.infoValue}>{formatDate(payment.paymentDate)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Payment Time:</Text>
          <Text style={styles.infoValue}>{formatTime(payment.paymentDate)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Payment Method:</Text>
          <Text style={styles.infoValue}>
            {payment.paymentMethod || "-"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Received By:</Text>
          <Text style={styles.infoValue}>{getReceivedBy()}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status:</Text>
          <Text
            style={[
              styles.infoValue,
              getStatus() === "Completed"
                ? styles.completedText
                : styles.pendingText,
            ]}
          >
            {getStatus()}
          </Text>
        </View>

        <View style={styles.noteDivider} />

        <Text style={styles.notesLabel}>Notes:</Text>
        <Text style={styles.notesText}>{payment.notes || "-"}</Text>
      </View>

      <View style={styles.footerDivider} />

      <Text style={styles.footerText}>
        This is a computer-generated receipt and does not require a signature.
      </Text>

      <Text style={styles.footerTextSmall}>
        Generated on: {formatDate(payment.paymentDate)} at{" "}
        {formatTime(payment.paymentDate)}
      </Text>

      <Text style={styles.footerTextSmall}>
        For queries, contact: +94 77 283 47483
      </Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={18} color="#444" />
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
          <Ionicons name="download-outline" size={18} color="#fff" />
          <Text style={styles.downloadButtonText}>Download</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 18,
    paddingBottom: 30,
    backgroundColor: "#f8f8f8",
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  backButton: {
    marginTop: 16,
    backgroundColor: "#53a68f",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  topTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 14,
    color: "#111",
  },
  successIconWrap: {
    alignItems: "center",
    marginTop: 10,
  },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#d8f3dc",
    justifyContent: "center",
    alignItems: "center",
  },
  successText: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },
  hostelName: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
  },
  subTitle: {
    textAlign: "center",
    color: "#888",
    marginTop: 4,
    fontSize: 13,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginTop: 18,
    marginBottom: 18,
  },
  receiptTitle: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
  },
  receiptNo: {
    textAlign: "center",
    color: "#999",
    fontSize: 13,
    marginTop: 6,
  },
  amountBox: {
    backgroundColor: "#d8f3dc",
    borderColor: "#8fd19e",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 18,
    marginBottom: 18,
  },
  amountLabel: {
    color: "#3f8f58",
    fontSize: 14,
    fontWeight: "500",
  },
  amountValue: {
    marginTop: 6,
    fontSize: 34,
    fontWeight: "700",
    color: "#2f9e59",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 16,
  },
  infoLabel: {
    color: "#777",
    fontSize: 15,
    flex: 1,
  },
  infoValue: {
    color: "#222",
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
    textAlign: "left",
  },
  completedText: {
    color: "#2f9e59",
    fontWeight: "700",
  },
  pendingText: {
    color: "#e67e22",
    fontWeight: "700",
  },
  noteDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginTop: 4,
    marginBottom: 12,
  },
  notesLabel: {
    color: "#777",
    fontSize: 15,
    marginBottom: 6,
  },
  notesText: {
    color: "#222",
    fontSize: 15,
  },
  footerDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginTop: 6,
    marginBottom: 18,
  },
  footerText: {
    textAlign: "center",
    color: "#999",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  footerTextSmall: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 12,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    gap: 12,
  },
  shareButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  shareButtonText: {
    color: "#444",
    fontWeight: "700",
    fontSize: 15,
  },
  downloadButton: {
    flex: 1,
    backgroundColor: "#53a68f",
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  downloadButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});