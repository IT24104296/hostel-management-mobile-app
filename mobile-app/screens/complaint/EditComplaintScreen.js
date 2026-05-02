import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import api from "../../services/api";

export default function EditComplaintScreen({ route, navigation }) {
  const complaint = route.params?.complaint;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [studentName, setStudentName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [loading, setLoading] = useState(false);

  const insets = useSafeAreaInsets();

  const categories = [
    "Plumbing", "Electrical", "Cleaning", "Furniture",
    "WiFi", "Painting", "Pest Control", "Others"
  ];

  // Pre-fill form with existing data
  useEffect(() => {
    if (complaint) {
      setTitle(complaint.title || "");
      setCategory(complaint.category || "");
      setRoomNumber(complaint.roomNumber || "");
      setStudentName(complaint.studentName || "");
      setDescription(complaint.description || "");
      setPriority(complaint.priority || "Medium");
    }
  }, [complaint]);

  const handleUpdate = async () => {
    if (!title || !category || !roomNumber || !description) {
      Alert.alert("Validation Error", "Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await api.put(`/api/complaints/${complaint._id}`, {
        title,
        category,
        roomNumber,
        studentName: studentName.trim() || "",
        description,
        priority,
      });

      Alert.alert("Success", "Complaint updated successfully!", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to update complaint");
    } finally {
      setLoading(false);
    }
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
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Edit Complaint</Text>
            <Text style={styles.headerSubtitle}>Update maintenance issue</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Issue Title <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Water leakage in bathroom"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category <Text style={styles.required}>*</Text></Text>
              <View style={styles.categoryContainer}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryBtn,
                      category === cat && styles.categoryBtnActive,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        category === cat && styles.categoryTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Room Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Room Number <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                value={roomNumber}
                onChangeText={setRoomNumber}
                placeholder="e.g. A-205"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Student Name (Optional) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Student Name (Optional)</Text>
              <TextInput
                style={styles.input}
                value={studentName}
                onChangeText={setStudentName}
                placeholder="Full name"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the issue in detail..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Priority */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Priority</Text>
              <View style={styles.priorityRow}>
                <TouchableOpacity
                  style={[styles.priorityBtn, priority === "High" && styles.priorityHigh]}
                  onPress={() => setPriority("High")}
                >
                  <Text style={[styles.priorityBtnText, priority === "High" && { color: "#fff" }]}>
                    High
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.priorityBtn, priority === "Medium" && styles.priorityMedium]}
                  onPress={() => setPriority("Medium")}
                >
                  <Text style={[styles.priorityBtnText, priority === "Medium" && { color: "#fff" }]}>
                    Medium
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.priorityBtn, priority === "Low" && styles.priorityLow]}
                  onPress={() => setPriority("Low")}
                >
                  <Text style={[styles.priorityBtnText, priority === "Low" && { color: "#fff" }]}>
                    Low
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Update Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleUpdate}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "Updating Complaint..." : "Update Complaint"}
            </Text>
          </TouchableOpacity>
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

  header: { marginBottom: 18 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#1F2937" },
  headerSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 2 },

  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },

  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
  required: { color: "#EF4444" },

  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
  },
  textArea: { height: 100, textAlignVertical: "top" },

  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryBtn: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryBtnActive: { backgroundColor: "#2E8B7D" },
  categoryText: { fontSize: 13, color: "#374151" },
  categoryTextActive: { color: "#fff" },

  priorityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 4,
    backgroundColor: "#F1F5F9",
  },
  priorityHigh: { backgroundColor: "#EF4444" },
  priorityMedium: { backgroundColor: "#F59E0B" },
  priorityLow: { backgroundColor: "#10B981" },
  priorityBtnText: { fontWeight: "600", fontSize: 14 },

  submitButton: {
    marginTop: 24,
    backgroundColor: "#2E8B7D",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  submitButtonDisabled: { backgroundColor: "#94A3B8" },
  submitButtonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});