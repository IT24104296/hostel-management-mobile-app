import React, { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";

const API_BASE_URL = "http://192.168.1.4:5000"; 

export default function AddStudentScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [nic, setNic] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [university, setUniversity] = useState("");

  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");

  const [status, setStatus] = useState("active");
  const [admissionDate, setAdmissionDate] = useState(null);
  const [leavingDate, setLeavingDate] = useState(null);

  const [showAdmissionPicker, setShowAdmissionPicker] = useState(false);
  const [showLeavingPicker, setShowLeavingPicker] = useState(false);

  const [loading, setLoading] = useState(false);

  const insets = useSafeAreaInsets();

  const formatDate = (date) => {
    if (!date) return "Select date";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const validate = () => {
    if (
      !fullName.trim() ||
      !nic.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !parentName.trim() ||
      !parentPhone.trim()
    ) {
      Alert.alert("Missing Details", "Please fill all required fields.");
      return false;
    }

    if (phone.trim().length < 10) {
      Alert.alert("Invalid Phone", "Student phone number must be at least 10 digits.");
      return false;
    }

    if (parentPhone.trim().length < 10) {
      Alert.alert("Invalid Phone", "Parent phone number must be at least 10 digits.");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const payload = {
        fullName: fullName.trim(),
        nic: nic.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        address: address.trim(),
        university: university.trim(),
        parentName: parentName.trim(),
        parentPhone: parentPhone.trim(),
        status,
        admissionDate,
        leavingDate,
      };

      await axios.post(`${API_BASE_URL}/api/students`, payload);

      Alert.alert("Success", "Student added successfully.");
      navigation.goBack();
    } catch (error) {
      console.log("Add student error:", error?.response?.data || error.message);
      const msg =
        error?.response?.data?.message || "Failed to add student.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#F4FBF8", "#BFE5DB"]} style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Row */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topBtn}>
              <Ionicons name="arrow-back" size={24} color="#5A5A5A" />
          </TouchableOpacity>

        <View style={{ width: 24 }} />
        </View>

        <Text style={styles.screenTitle}>Add Student</Text>

        {/* Personal Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal information</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.half]}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={[styles.inputGroup, styles.half]}>
              <Text style={styles.label}>NIC</Text>
              <TextInput
                style={styles.input}
                value={nic}
                onChangeText={setNic}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Whatsapp Number</Text>
            <TextInput
              style={styles.input}
              value={whatsapp}
              onChangeText={setWhatsapp}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>University</Text>
            <TextInput
              style={styles.input}
              value={university}
              onChangeText={setUniversity}
            />
          </View>
        </View>

        {/* Parent Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Parent Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={parentName}
              onChangeText={setParentName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={parentPhone}
              onChangeText={setParentPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Student Status / Dates */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Student Status</Text>

          <View style={styles.inputGroup}>
  <View style={styles.labelRow}>
    <Text style={styles.label}>Admission Date</Text>

    {admissionDate && (
      <TouchableOpacity onPress={() => setAdmissionDate(null)}>
        <Text style={styles.clearDateText}>Clear</Text>
      </TouchableOpacity>
    )}
  </View>

  <TouchableOpacity
    style={styles.dateInput}
    onPress={() => setShowAdmissionPicker(true)}
  >
    <Text style={styles.dateText}>
      {admissionDate ? formatDate(admissionDate) : "Select admission date"}
    </Text>
    <Ionicons name="calendar-outline" size={18} color="#666" />
  </TouchableOpacity>
</View>
<View style={styles.inputGroup}>
  <View style={styles.labelRow}>
    <Text style={styles.label}>Leaving Date</Text>

    {leavingDate && (
      <TouchableOpacity onPress={() => setLeavingDate(null)}>
        <Text style={styles.clearDateText}>Clear</Text>
      </TouchableOpacity>
    )}
  </View>

  <TouchableOpacity
    style={styles.dateInput}
    onPress={() => setShowLeavingPicker(true)}
  >
    <Text style={styles.dateText}>
      {leavingDate ? formatDate(leavingDate) : "Select leaving date"}
    </Text>
    <Ionicons name="calendar-outline" size={18} color="#666" />
  </TouchableOpacity>
</View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusRow}>
              <TouchableOpacity
                style={[
                  styles.statusBtn,
                  status === "active" && styles.statusBtnActive,
                ]}
                onPress={() => setStatus("active")}
              >
                <Text
                  style={[
                    styles.statusBtnText,
                    status === "active" && styles.statusBtnTextActive,
                  ]}
                >
                  Active
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusBtn,
                  status === "inactive" && styles.statusBtnInactive,
                ]}
                onPress={() => setStatus("inactive")}
              >
                <Text
                  style={[
                    styles.statusBtnText,
                    status === "inactive" && styles.statusBtnTextInactive,
                  ]}
                >
                  Inactive
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
          <View style={styles.bottomButtonRow}>
  <TouchableOpacity
    onPress={() => navigation.goBack()}
    style={styles.bottomCancelBtn}
  >
    <Text style={styles.bottomCancelText}>Cancel</Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={handleSave}
    style={styles.bottomSaveBtn}
    disabled={loading}
  >
    {loading ? (
      <ActivityIndicator color="#fff" />
    ) : (
      <Text style={styles.bottomSaveText}>Save</Text>
    )}
  </TouchableOpacity>
</View>        
      </ScrollView>

      {showAdmissionPicker && (
  <DateTimePicker
    value={admissionDate || new Date()}
    mode="date"
    display="default"
    onChange={(event, selectedDate) => {
      setShowAdmissionPicker(false);

      if (event.type === "set" && selectedDate) {
        setAdmissionDate(selectedDate);
      }
      
    }}
  />
)}

     {showLeavingPicker && (
  <DateTimePicker
    value={leavingDate || new Date()}
    mode="date"
    display="default"
    onChange={(event, selectedDate) => {
      setShowLeavingPicker(false);

      if (event.type === "set" && selectedDate) {
        setLeavingDate(selectedDate);
      }
    }}
  />
)}
      
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 40,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topBtn: {
    padding: 6,
  },
  topRightButtons: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#F3F3F3",
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
  },
  cancelText: {
    color: "#58A895",
    fontWeight: "700",
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: "#58A895",
    paddingHorizontal: 18,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 56,
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  screenTitle: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    marginTop: 18,
    marginBottom: 18,
  },

  card: {
    backgroundColor: "#F9F9F9",
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
    marginBottom: 14,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  half: {
    flex: 1,
  },

  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 15,
    color: "#666",
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    height: 42,
    borderWidth: 1,
    borderColor: "#CFCFCF",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FAFAFA",
    fontSize: 15,
    color: "#111",
  },

  dateInput: {
    height: 42,
    borderWidth: 1,
    borderColor: "#CFCFCF",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FAFAFA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: {
    fontSize: 15,
    color: "#111",
  },

  statusRow: {
    flexDirection: "row",
    gap: 10,
  },
  statusBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D0D0D0",
    backgroundColor: "#F3F3F3",
    alignItems: "center",
    justifyContent: "center",
  },
  statusBtnActive: {
    backgroundColor: "#D8F2E7",
    borderColor: "#58A895",
  },
  statusBtnInactive: {
    backgroundColor: "#FDE2DE",
    borderColor: "#E16A5E",
  },
  statusBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#555",
  },
  statusBtnTextActive: {
    color: "#2C7C68",
  },
  statusBtnTextInactive: {
    color: "#C14D42",
  },
  bottomButtonRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 8,
  marginBottom: 20,
  gap: 12,
},

bottomCancelBtn: {
  flex: 1,
  height: 46,
  borderRadius: 12,
  backgroundColor: "#F3F3F3",
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 1,
  borderColor: "#D8D8D8",
},

bottomCancelText: {
  color: "#58A895",
  fontWeight: "700",
  fontSize: 16,
},

bottomSaveBtn: {
  flex: 1,
  height: 46,
  borderRadius: 12,
  backgroundColor: "#58A895",
  justifyContent: "center",
  alignItems: "center",
},

bottomSaveText: {
  color: "#fff",
  fontWeight: "700",
  fontSize: 16,
},

labelRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
},

clearDateText: {
  fontSize: 13,
  fontWeight: "600",
  color: "#2E8B7D",
},

});