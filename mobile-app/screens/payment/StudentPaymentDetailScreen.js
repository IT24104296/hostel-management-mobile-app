import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";

import api from "../../services/api";

export default function StudentPaymentDetailScreen({ navigation, route }) {
  const { studentId } = route.params || {};
  const insets = useSafeAreaInsets();

  const [student, setStudent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Record / Edit Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [referenceNo, setReferenceNo] = useState("");
  const [notes, setNotes] = useState("");
  const [recordedBy, setRecordedBy] = useState("");
  const [paidDate, setPaidDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // View Details Modal
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewPayment, setViewPayment] = useState(null);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/payments/${studentId}/history`);
      setStudent(res.data.student);
      setPayments(res.data.payments || []);
    } catch (error) {
      console.error("History fetch error:", error);
      Alert.alert("Error", "Failed to load payment history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) fetchPaymentHistory();
  }, [studentId]);

  const formatBillingPeriod = (dueDate) => {
    if (!dueDate) return "—";
    const start = new Date(dueDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    const startStr = start.toLocaleDateString("en-US", { day: "numeric", month: "short" });
    const endStr = end.toLocaleDateString("en-US", { day: "numeric", month: "short" });
    return `${startStr} - ${endStr}`;
  };

  const handleRecordPayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        amount: parseFloat(amount),
        method,
        referenceNo: referenceNo.trim() || undefined,
        notes: notes.trim() || undefined,
        recordedBy: recordedBy.trim() || undefined,
        paidDate: paidDate.toISOString(),
      };

      if (isEditMode && selectedPayment) {
        await api.put(`/api/payments/${selectedPayment._id}`, payload);
        Alert.alert("Success", "Payment updated successfully");
      } else {
        await api.post("/api/payments/record", { ...payload, studentId });
        Alert.alert("Success", "Payment recorded successfully");
      }

      setModalVisible(false);
      fetchPaymentHistory();
    } catch (error) {
      console.error("Payment error:", error.response?.data || error.message);
      const msg = error.response?.data?.message || "Failed to save payment";
      Alert.alert("Error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (payment) => {
    setSelectedPayment(payment);
    setIsEditMode(true);
    setAmount(payment.amount.toString());
    setMethod(payment.method || "cash");
    setReferenceNo(payment.referenceNo || "");
    setNotes(payment.notes || "");
    setRecordedBy(payment.recordedBy || "");
    setPaidDate(payment.paidDate ? new Date(payment.paidDate) : new Date());
    setModalVisible(true);
  };

  const openViewModal = (payment) => {
    setViewPayment(payment);
    setViewModalVisible(true);
  };

  const handleDelete = (payment) => {
    Alert.alert("Delete Payment", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/api/payments/${payment._id}`);
            Alert.alert("Success", "Payment deleted");
            fetchPaymentHistory();
          } catch (error) {
            Alert.alert("Error", "Failed to delete payment");
          }
        },
      },
    ]);
  };

  const openReceipt = (payment) => {
    navigation.navigate("PaymentReceipt", {
      payment: payment,
      student: student,
    });
  };

  const formatDate = (date) => {
    if (!date) return "—";
    const d = new Date(date);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const renderPaymentItem = ({ item }) => {
    const isPending = item.status === "pending";

    // Show student's monthlyRent for pending logs
    const displayAmount = isPending 
      ? (student?.monthlyRent || 0) 
      : (item.amount || 0);

    return (
      <View style={styles.timelineItem}>
        <View style={styles.timelineDotContainer}>
          <View style={[styles.timelineDot, isPending && styles.pendingDot]} />
          {item !== payments[payments.length - 1] && <View style={styles.timelineLine} />}
        </View>

        <View style={styles.paymentContent}>
          <View style={styles.paymentHeader}>
            <Text style={styles.billingPeriod}>
              {item.type === "admission" ? "Admission Fee" : formatBillingPeriod(item.dueDate)}
            </Text>
            <View style={[styles.statusBadge, isPending ? styles.pendingBadge : styles.paidBadge]}>
              <Text style={[styles.statusText, isPending ? styles.pendingText : styles.paidText]}>
                {isPending ? "PENDING" : "PAID"}
              </Text>
            </View>
          </View>

          <Text style={styles.dueDateText}>Due: {formatDate(item.dueDate)}</Text>

          {displayAmount > 0 && (
            <Text style={styles.amountText}>
              LKR {parseFloat(displayAmount).toLocaleString("en-US")}
              {isPending && " (Monthly Rent)"}
            </Text>
          )}

          {item.paidDate && (
            <Text style={styles.paidDateText}>Paid on {formatDate(item.paidDate)}</Text>
          )}

          {item.recordedBy && (
            <Text style={styles.receivedByText}>Received by: {item.recordedBy}</Text>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={() => openViewModal(item)} style={styles.actionBtn}>
              <Ionicons name="eye-outline" size={22} color="#58A895" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionBtn}>
              <Ionicons name="create-outline" size={22} color="#F59E0B" />
            </TouchableOpacity>

            {item.status === "paid" && (
              <TouchableOpacity onPress={() => openReceipt(item)} style={styles.actionBtn}>
                <Ionicons name="receipt-outline" size={22} color="#10B981" />
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
              <Ionicons name="trash-outline" size={22} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={["#F4FBF8", "#BFE5DB"]} style={styles.container}>
        <ActivityIndicator size="large" color="#58A895" style={{ flex: 1 }} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#F4FBF8", "#BFE5DB"]} style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={26} color="#111" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Payment History</Text>
        </View>

        <View style={styles.studentCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👨‍🎓</Text>
          </View>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{student?.fullName}</Text>
            <Text style={styles.roomText}>
              Room {student?.room?.roomNumber || "—"} • {student?.studentId}
            </Text>
          </View>
        </View>

        <View style={styles.nextDueCard}>
          <Text style={styles.nextDueLabel}>Next Due Date</Text>
          <Text style={styles.nextDueValue}>
            {student?.nextDueDate
              ? new Date(student.nextDueDate).toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "Not Set"}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Payment History</Text>

        <FlatList
          data={payments}
          keyExtractor={(item) => item._id}
          renderItem={renderPaymentItem}
          scrollEnabled={false}
          ListEmptyComponent={<Text style={styles.emptyText}>No payment records yet</Text>}
        />
      </ScrollView>

      {/* Floating Button */}
      <TouchableOpacity
        style={styles.floatingBtn}
        onPress={() => {
          setIsEditMode(false);
          setSelectedPayment(null);
          setAmount("");
          setReferenceNo("");
          setNotes("");
          setRecordedBy("");
          setMethod("cash");
          setPaidDate(new Date());
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* ==================== RECORD / EDIT MODAL ==================== */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {isEditMode ? "Edit Payment" : "Record Payment"}
              </Text>

              <Text style={styles.modalLabel}>Amount (LKR)</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                placeholder="15000"
              />

              <Text style={styles.modalLabel}>Payment Method</Text>
              <View style={styles.methodRow}>
                {["cash", "bank_transfer", "online"].map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.methodBtn, method === m && styles.methodBtnActive]}
                    onPress={() => setMethod(m)}
                  >
                    <Text style={[styles.methodText, method === m && styles.methodTextActive]}>
                      {m === "cash" ? "Cash" : m === "bank_transfer" ? "Bank" : "Online"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Reference No. (Optional)</Text>
              <TextInput
                style={styles.modalInput}
                value={referenceNo}
                onChangeText={setReferenceNo}
                placeholder="Bank slip / Transaction ID"
              />

              <Text style={styles.modalLabel}>Payment Received By</Text>
              <TextInput
                style={styles.modalInput}
                value={recordedBy}
                onChangeText={setRecordedBy}
                placeholder="Admin / Staff Name"
              />

              <Text style={styles.modalLabel}>Notes</Text>
              <TextInput
                style={[styles.modalInput, { height: 80 }]}
                multiline
                value={notes}
                onChangeText={setNotes}
                placeholder="Any additional notes..."
              />

              <View style={styles.modalButtonRow}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalSaveBtn} onPress={handleRecordPayment} disabled={submitting}>
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.modalSaveText}>
                      {isEditMode ? "Update Payment" : "Save Payment"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ==================== VIEW DETAILS MODAL ==================== */}
      <Modal visible={viewModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Payment Details</Text>

              {viewPayment && (
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.modalLabel}>Type</Text>
                  <Text style={styles.detailValue}>
                    {viewPayment.type === "admission" ? "Admission Fee" : "Monthly Rent"}
                  </Text>

                  <Text style={styles.modalLabel}>Due Date</Text>
                  <Text style={styles.detailValue}>{formatDate(viewPayment.dueDate)}</Text>

                  <Text style={styles.modalLabel}>Amount</Text>
                  <Text style={styles.detailValue}>
                    LKR {parseFloat(viewPayment.amount || student?.monthlyRent || 0).toLocaleString("en-US")}
                  </Text>

                  <Text style={styles.modalLabel}>Paid Date</Text>
                  <Text style={styles.detailValue}>{formatDate(viewPayment.paidDate)}</Text>

                  <Text style={styles.modalLabel}>Received By</Text>
                  <Text style={styles.detailValue}>{viewPayment.recordedBy || "—"}</Text>

                  <Text style={styles.modalLabel}>Method</Text>
                  <Text style={styles.detailValue}>{viewPayment.method || "—"}</Text>

                  <Text style={styles.modalLabel}>Reference No.</Text>
                  <Text style={styles.detailValue}>{viewPayment.referenceNo || "—"}</Text>

                  <Text style={styles.modalLabel}>Notes</Text>
                  <Text style={styles.detailValue}>{viewPayment.notes || "—"}</Text>
                </View>
              )}

              <View style={{ marginTop: 20 }}>
                <TouchableOpacity
                  style={[styles.modalCancelBtn, { backgroundColor: "#58A895" }]}
                  onPress={() => setViewModalVisible(false)}
                >
                  <Text style={[styles.modalCancelText, { color: "#fff" }]}>Close</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {showDatePicker && (
        <DateTimePicker
          value={paidDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setPaidDate(selectedDate);
          }}
        />
      )}
    </LinearGradient>
  );
}

/* ==================== STYLES ==================== */
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },

  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backBtn: { padding: 6, marginRight: 12 },
  screenTitle: { fontSize: 24, fontWeight: "700", color: "#111" },

  studentCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E0F2F1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: { fontSize: 28 },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 18, fontWeight: "700", color: "#111" },
  roomText: { fontSize: 14, color: "#666", marginTop: 2 },

  nextDueCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  nextDueLabel: { fontSize: 14, color: "#555", fontWeight: "600" },
  nextDueValue: { fontSize: 22, fontWeight: "700", color: "#58A895", marginTop: 6 },

  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#111", marginBottom: 12 },

  timelineItem: { flexDirection: "row", marginBottom: 20 },
  timelineDotContainer: { width: 24, alignItems: "center" },
  timelineDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#58A895", marginTop: 4 },
  pendingDot: { backgroundColor: "#F59E0B" },
  timelineLine: { width: 2, flex: 1, backgroundColor: "#E5E5E5", marginTop: 8 },

  paymentContent: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginLeft: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  paymentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  billingPeriod: { fontSize: 16, fontWeight: "700", color: "#111" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  paidBadge: { backgroundColor: "#D1FAE5" },
  pendingBadge: { backgroundColor: "#FEF3C7" },
  statusText: { fontSize: 12, fontWeight: "700" },
  paidText: { color: "#10B981" },
  pendingText: { color: "#D97706" },

  dueDateText: { fontSize: 13, color: "#666", marginTop: 6 },
  amountText: { fontSize: 17, fontWeight: "700", color: "#111", marginTop: 6 },
  paidDateText: { fontSize: 13, color: "#10B981", marginTop: 4 },
  receivedByText: { fontSize: 13, color: "#555", marginTop: 6 },

  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 16,
  },
  actionBtn: { padding: 4 },

  floatingBtn: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 62,
    height: 62,
    backgroundColor: "#58A895",
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "85%",
  },
  modalTitle: { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 20 },
  modalLabel: { fontSize: 15, fontWeight: "600", color: "#555", marginTop: 16, marginBottom: 6 },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
  },
  methodRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  methodBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  methodBtnActive: { backgroundColor: "#58A895" },
  methodText: { fontWeight: "600", color: "#555" },
  methodTextActive: { color: "#fff" },

  modalSaveBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#58A895",
  },
  modalSaveText: { color: "#fff", fontSize: 17, fontWeight: "700" },

  modalCancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E5E7EB",
  },
  modalCancelText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "600",
  },

  detailValue: { fontSize: 16, color: "#111", marginBottom: 12 },

  emptyText: { textAlign: "center", color: "#888", fontSize: 16, marginTop: 40 },

  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 24,
  },
});