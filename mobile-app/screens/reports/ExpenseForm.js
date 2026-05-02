// ═══════════════════════════════════════════════════════════════════
//  mobile-app/screens/ExpenseForm.js  —  NEW FILE
//
//  PURPOSE:
//  Single screen that handles BOTH adding a new expense AND editing
//  an existing one. The mode is determined by route.params:
//    • No params  → Add mode  (blank form, POST request)
//    • expense passed in params → Edit mode (pre-filled form, PUT request)
//
//  FIELDS:
//  Title       — text input (required)
//  Category    — picker with 7 options (required)
//  Amount      — numeric input (required)
//  Date        — date picker (defaults to today)
//  Description — optional text input for notes
//
//  NAVIGATION:
//  On success → goes back to ExpenseList screen
//  Cancel button → goes back without saving
// ═══════════════════════════════════════════════════════════════════

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

// The 7 expense categories matching the backend enum in Expense.js
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

  // ── Determine mode: Add or Edit ───────────────────────────────
  // If an expense object was passed via navigation, we are in Edit mode.
  // Otherwise we are in Add mode with a blank form.
  const existingExpense = route.params?.expense || null;
  const isEditMode      = existingExpense !== null;

  // ── Form state — pre-filled if editing ───────────────────────
  const [title,       setTitle]       = useState(existingExpense?.title       || "");
  const [category,    setCategory]    = useState(existingExpense?.category    || "Electricity");
  const [amount,      setAmount]      = useState(existingExpense?.amount?.toString() || "");
  const [description, setDescription] = useState(existingExpense?.description || "");

  // Date state — parse existing date or default to today
  const [date,     setDate]     = useState(
    existingExpense?.date ? new Date(existingExpense.date) : new Date()
  );
  const [showDate, setShowDate] = useState(false);

  // Saving state — disables button while request is in progress
  const [saving, setSaving] = useState(false);

  // ── Validation ────────────────────────────────────────────────
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

  // ── Submit handler ────────────────────────────────────────────
  // Calls POST for Add mode, PUT for Edit mode
  const handleSubmit = async () => {
    if (!validate()) return;

    setSaving(true);

    try {
      // Build the request body
      const body = {
        title:       title.trim(),
        category,
        amount:      parseFloat(amount),
        date:        date.toISOString().split("T")[0],
        description: description.trim(),
      };

      // Decide URL and method based on mode
      const url    = isEditMode
        ? `http://10.0.2.2:5000/api/expenses/${existingExpense._id}`
        : "http://10.0.2.2:5000/api/expenses";

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setSaving(false);

      Alert.alert(
        "Success",
        isEditMode ? "Expense updated successfully." : "Expense added successfully.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );

    } catch (error) {
      setSaving(false);
      console.error("Submit error:", error);
      Alert.alert("Error", error.message || "Failed to save expense.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* ── SCREEN TITLE ────────────────────────────────────────── */}
      <Text style={styles.title}>
        {isEditMode ? "Edit Expense" : "Add Expense"}
      </Text>

      {/* ── TITLE FIELD ─────────────────────────────────────────── */}
      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. March Electricity Bill"
        value={title}
        onChangeText={setTitle}
        maxLength={100}
      />

      {/* ── CATEGORY PICKER ─────────────────────────────────────── */}
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

      {/* ── AMOUNT FIELD ────────────────────────────────────────── */}
      <Text style={styles.label}>Amount (Rs) *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 4500"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      {/* ── DATE PICKER ─────────────────────────────────────────── */}
      <Text style={styles.label}>Date</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDate(true)}
      >
        <Text style={styles.dateButtonText}>
          {date.toLocaleDateString()}
        </Text>
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

      {/* ── DESCRIPTION FIELD ───────────────────────────────────── */}
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

      {/* ── SUBMIT BUTTON ───────────────────────────────────────── */}
      <TouchableOpacity
        style={[styles.submitButton, saving && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={saving}
      >
        {saving
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.submitButtonText}>
              {isEditMode ? "Update Expense" : "Add Expense"}
            </Text>
        }
      </TouchableOpacity>

      {/* ── CANCEL BUTTON ───────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    padding: 20,
    backgroundColor: "#F5F6FA",
    flexGrow: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 24,
  },

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