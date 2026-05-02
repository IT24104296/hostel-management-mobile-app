import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Alert,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import api from "../../services/api";

export default function ComplaintDetailScreen({ route, navigation }) {
  const complaint = route.params?.complaint;
  const [loading, setLoading] = useState(false);

  const insets = useSafeAreaInsets();

  if (!complaint) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.errorText}>Complaint not found</Text>
      </SafeAreaView>
    );
  }

  const priorityColor =
    complaint.priority === "High"
      ? "#EF4444"
      : complaint.priority === "Medium"
      ? "#F59E0B"
      : "#10B981";

  const statusColor =
    complaint.status === "Pending"
      ? "#F59E0B"
      : complaint.status === "In Progress"
      ? "#3B82F6"
      : "#10B981";

  // Quick status update
  const updateStatus = async (newStatus) => {
    setLoading(true);
    try {
      await api.put(`/api/complaints/${complaint._id}`, { status: newStatus });
      Alert.alert("Success", `Complaint marked as ${newStatus}`);
      navigation.goBack(); // refresh list
    } catch (err) {
      Alert.alert("Error", "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const deleteComplaint = () => {
    Alert.alert(
      "Delete Complaint",
      "Are you sure you want to delete this complaint?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/api/complaints/${complaint._id}`);
              Alert.alert("Deleted", "Complaint has been deleted");
              navigation.goBack();
            } catch (err) {
              Alert.alert("Error", "Failed to delete complaint");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={["#E6F2EF", "#BFDAD5"]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Complaint Details</Text>
          </View>

          {/* Main Card */}
          <View style={styles.card}>
            {/* Status & Priority */}
            <View style={styles.badgesRow}>
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={styles.statusText}>{complaint.status}</Text>
              </View>
              <View style={[styles.priorityBadge, { backgroundColor: priorityColor + "20" }]}>
                <Text style={[styles.priorityText, { color: priorityColor }]}>
                  {complaint.priority}
                </Text>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>{complaint.title}</Text>

            {/* Category */}
            <Text style={styles.category}>{complaint.category}</Text>

            {/* Room & Student */}
            <Text style={styles.infoText}>
              Room {complaint.roomNumber} {complaint.studentName ? `• ${complaint.studentName}` : ""}
            </Text>

            {/* Description */}
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{complaint.description}</Text>

            {/* Notes */}
            {complaint.notes ? (
              <>
                <Text style={styles.sectionTitle}>Notes / Resolution</Text>
                <Text style={styles.notes}>{complaint.notes}</Text>
              </>
            ) : null}

            {/* Dates */}
            <Text style={styles.dateText}>
              Reported: {new Date(complaint.createdAt).toDateString()}
            </Text>
            {complaint.resolvedDate && (
              <Text style={styles.dateText}>
                Resolved: {new Date(complaint.resolvedDate).toDateString()}
              </Text>
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.actionContainer}>
            {complaint.status !== "In Progress" && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => updateStatus("In Progress")}
              >
                <MaterialIcons name="build" size={22} color="#3B82F6" />
                <Text style={styles.actionBtnText}>Mark In Progress</Text>
              </TouchableOpacity>
            )}

            {complaint.status !== "Resolved" && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => updateStatus("Resolved")}
              >
                <MaterialIcons name="check-circle" size={22} color="#10B981" />
                <Text style={styles.actionBtnText}>Mark Resolved</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate("EditComplaint", { complaint })}
            >
              <MaterialIcons name="edit" size={22} color="#10B981" />
              <Text style={styles.editBtnText}>Edit Details</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteBtn} onPress={deleteComplaint}>
              <MaterialIcons name="delete" size={22} color="#EF4444" />
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  gradient: { flex: 1 },
  scrollView: { flex: 1 },
  container: { paddingHorizontal: 16, paddingTop: 10 },

  header: { marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#1F2937" },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },

  badgesRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 8 },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "600" },

  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: { fontSize: 12, fontWeight: "600" },

  title: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 4 },
  category: { fontSize: 14, color: "#64748B", marginBottom: 12 },
  infoText: { fontSize: 14, color: "#374151", marginBottom: 16 },

  sectionTitle: { fontSize: 14, fontWeight: "600", color: "#374151", marginTop: 16, marginBottom: 6 },
  description: { fontSize: 15, color: "#1F2937", lineHeight: 22 },
  notes: { fontSize: 15, color: "#1F2937", lineHeight: 22, fontStyle: "italic" },

  dateText: { fontSize: 13, color: "#9CA3AF", marginTop: 12 },

  actionContainer: { marginTop: 10 },
  actionBtn: {
    backgroundColor: "#F1F5F9",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  actionBtnText: { fontSize: 15, fontWeight: "600", marginLeft: 8 },

  editBtn: {
    backgroundColor: "#E6F2EF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  editBtnText: { color: "#10B981", fontWeight: "600", fontSize: 15, marginLeft: 8 },

  deleteBtn: {
    backgroundColor: "#FEE2E2",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  deleteBtnText: { color: "#EF4444", fontWeight: "600", fontSize: 15, marginLeft: 8 },
});