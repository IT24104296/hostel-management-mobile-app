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
  Platform 
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { validateContract } from "../../utils/ContractValidation";
import api from "../../services/api";

export default function EditContractScreen({ route, navigation }) {
  const contract = route.params?.contract;

  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [moveInDate, setMoveInDate] = useState(null);
  const [duration, setDuration] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const insets = useSafeAreaInsets();

  // Pre-fill form when screen loads
  // Pre-fill form when screen loads
useEffect(() => {
  if (contract) {
    setName(contract.name || contract.studentName || "");           // support both
    setStudentId(contract.studentId || "");
    setContactNumber(contract.contactNumber || "");
    setRoomNumber(contract.roomNumber || contract.room?.replace("Room ", "") || ""); // handle formatted room
    setDuration(contract.durationMonths?.toString() || "");

    if (contract.moveInDate) {
      const date = new Date(contract.moveInDate);
      setMoveInDate(date);
    } else if (contract.startDate) {
      const date = new Date(contract.startDate);
      setMoveInDate(date);
    }

    if (contract.durationMonths && moveInDate) {
      const end = new Date(moveInDate);
      end.setMonth(end.getMonth() + parseInt(contract.durationMonths));
      setEndDate(end.toDateString());
    }
  }
}, [contract]);

  // ✅ END DATE CALCULATION
  const calculateEndDate = (date, months) => {
    if (!date || !months) return "";
    let newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + parseInt(months));
    return newDate.toDateString();
  };

  const handleDurationChange = (val) => {
    setDuration(val);
    if (moveInDate && val) {
      setEndDate(calculateEndDate(moveInDate, val));
    }
  };

  const handleDateChange = (e, date) => {
    setShowPicker(false);
    if (date) {
      setMoveInDate(date);
      if (duration) {
        setEndDate(calculateEndDate(date, duration));
      }
    }
  };

  const updateContract = async () => {
    const validationErrors = validateContract({
      name,
      studentId,
      contactNumber,
      roomNumber,
      moveInDate,
      duration
    });

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      Alert.alert("Validation Error", "Please fix the errors before updating.");
      return;
    }

    setLoading(true);
    try {
      await api.put(`/api/contracts/${contract.id}`, {
        studentName: name,
        studentId,
        contactNumber,
        roomNumber,
        moveInDate: moveInDate ? moveInDate.toISOString() : null,
        durationMonths: Number(duration)
      });

      Alert.alert("Success", "Contract updated successfully!", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to update contract");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={["#E6F2EF", "#BFDAD5"]}  
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.container,
            { paddingBottom: insets.bottom + 40 }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Modern Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Edit Contract</Text>
            <Text style={styles.headerSubtitle}>Update student accommodation details</Text>
          </View>

          {/* Elevated Form Card */}
          <View style={styles.formCard}>
            
            {/* Student Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Student Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={name}
                onChangeText={setName}
                placeholder="Full name"
                placeholderTextColor="#94A3B8"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Student ID */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Student ID <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.studentId && styles.inputError]}
                value={studentId}
                onChangeText={setStudentId}
                placeholder="ID number"
                placeholderTextColor="#94A3B8"
              />
              {errors.studentId && <Text style={styles.errorText}>{errors.studentId}</Text>}
            </View>

            {/* Contact Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Contact Number <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.contactNumber && styles.inputError]}
                value={contactNumber}
                onChangeText={setContactNumber}
                keyboardType="phone-pad"
                placeholder="+94 XX XXX XXXX"
                placeholderTextColor="#94A3B8"
              />
              {errors.contactNumber && <Text style={styles.errorText}>{errors.contactNumber}</Text>}
            </View>

            {/* Room Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Room Number <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.roomNumber && styles.inputError]}
                value={roomNumber}
                onChangeText={setRoomNumber}
                keyboardType="numeric"
                placeholder="e.g. A-205"
                placeholderTextColor="#94A3B8"
              />
              {errors.roomNumber && <Text style={styles.errorText}>{errors.roomNumber}</Text>}
            </View>

            {/* Move-in Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Move-in Date <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity 
                style={[styles.input, styles.dateInput, errors.moveInDate && styles.inputError]}
                onPress={() => setShowPicker(true)}
              >
                <Text style={moveInDate ? styles.dateText : styles.placeholderText}>
                  {moveInDate ? new Date(moveInDate).toDateString() : "Select move-in date"}
                </Text>
              </TouchableOpacity>
              {errors.moveInDate && <Text style={styles.errorText}>{errors.moveInDate}</Text>}
            </View>

            {/* Contract Duration */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Contract Duration <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.durationRow}>
                <TextInput
                  style={[styles.durationInput, errors.duration && styles.inputError]}
                  value={duration}
                  onChangeText={handleDurationChange}
                  keyboardType="numeric"
                  placeholder="6"
                  placeholderTextColor="#94A3B8"
                />
                <Text style={styles.monthText}>Months</Text>
              </View>
              {errors.duration && <Text style={styles.errorText}>{errors.duration}</Text>}
            </View>

            {/* Auto-calculated End Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>End Date</Text>
              <View style={styles.endDateContainer}>
                <Text style={[
                  styles.endDateText, 
                  !endDate && { fontStyle: 'italic', color: '#94A3B8' }
                ]}>
                  {endDate || "Will be calculated automatically"}
                </Text>
              </View>
            </View>
          </View>

          {/* Premium Gradient Update Button */}
          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
            onPress={updateContract}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Updating..." : "Update Contract"}
            </Text>
          </TouchableOpacity>

          {/* Date Picker */}
          {showPicker && (
            <DateTimePicker
              value={moveInDate || new Date()}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={handleDateChange}
            />
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

// ====================== STYLES (Exactly same as AddContractScreen) ======================
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
  inputError: { borderColor: "#EF4444" },
  dateInput: { justifyContent: "center" },
  dateText: { fontSize: 14, color: "#111827" },
  placeholderText: { fontSize: 14, color: "#9CA3AF" },

  durationRow: { flexDirection: "row", alignItems: "center" },
  durationInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    width: 90,
    color: "#111827",
    marginRight: 10,
  },
  monthText: { fontSize: 14, color: "#6B7280" },

  endDateContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 12,
  },
  endDateText: { fontSize: 14, color: "#374151" },

  errorText: { color: "#EF4444", fontSize: 12, marginTop: 4 },

  saveButton: {
    marginTop: 24,
    backgroundColor: "#2E8B7D",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonDisabled: { backgroundColor: "#94A3B8" },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});