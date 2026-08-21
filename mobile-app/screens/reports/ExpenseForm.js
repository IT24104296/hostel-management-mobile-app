import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import api from "../../services/api";

// Expense categories (matching your backend enum)
const CATEGORIES = [
  "Electricity",
  "Water",
  "Internet",
  "Maintenance",
  "Cleaning",
  "Staff Salary",
  "Other",
];

export default function ExpenseForm({ route, navigation }) {
  const insets = useSafeAreaInsets();

  // Determine Add or Edit mode
  const existingExpense = route.params?.expense || null;
  const isEditMode = existingExpense !== null;

  // Form state
  const [title, setTitle] = useState(existingExpense?.title || "");
  const [category, setCategory] = useState(existingExpense?.category || "Electricity");
  const [amount, setAmount] = useState(existingExpense?.amount?.toString() || "");
  const [description, setDescription] = useState(existingExpense?.description || "");

  const [date, setDate] = useState(
    existingExpense?.date ? new Date(existingExpense.date) : new Date()
  );
  const [showDate, setShowDate] = useState(false);

  const [saving, setSaving] = useState(false);

  // Validation
  const validate = () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Please enter a title.");
      return false;
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      Alert.alert("Validation Error", "Please enter a valid amount.");
      return false;
    }
    return true;
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!validate()) return;

    setSaving(true);

    try {
      const body = {
        title: title.trim(),
        category,
        amount: parseFloat(amount),
        date: date.toISOString().split("T")[0],
        description: description.trim(),
      };

      if (isEditMode) {
        await api.put(`/api/expenses/${existingExpense._id}`, body);
        Alert.alert("Success", "Expense updated successfully.", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        await api.post("/api/expenses", body);
        Alert.alert("Success", "Expense added successfully.", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error("Submit error:", error);
      const msg = error.response?.data?.message || "Failed to save expense.";
      Alert.alert("Error", msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient
      colors={["#F4FBF8", "#BFE5DB"]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>
          {isEditMode ? "Edit Expense" : "Add Expense"}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. March Electricity Bill"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        {/* Category */}
        <Text style={styles.label}>Category *</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={category}
            onValueChange={(val) => setCategory(val)}
            style={styles.picker}
          >
            {CATEGORIES.map((cat) => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
        </View>

        {/* Amount */}
        <Text style={styles.label}>Amount (Rs) *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 4500"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        {/* Date */}
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDate(true)}>
          <Text style={styles.dateButtonText}>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>

        {showDate && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDate(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        {/* Description */}
        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Any additional notes..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          maxLength={300}
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, saving && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditMode ? "Update Expense" : "Add Expense"}
            </Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 6, marginRight: 12 },
  screenTitle: { fontSize: 24, fontWeight: "700", color: "#111" },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
    marginTop: 16,
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: "#333",
    elevation: 2,
  },

  textArea: {
    height: 90,
    textAlignVertical: "top",
  },

  pickerWrapper: {
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 2,
    overflow: "hidden",
  },

  picker: {
    height: 52,
    color: "#333",
  },

  dateButton: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    elevation: 2,
  },

  dateButtonText: {
    fontSize: 15,
    color: "#333",
  },

  submitButton: {
    backgroundColor: "#07810d",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 32,
  },

  buttonDisabled: {
    backgroundColor: "#aaa",
  },

  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  cancelButton: {
    backgroundColor: "#eee",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  cancelButtonText: {
    color: "#555",
    fontSize: 15,
    fontWeight: "600",
  },
});