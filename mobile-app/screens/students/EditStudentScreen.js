import React, { useEffect, useState } from "react";
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
  Image,                    // ← NEW
} from "react-native";
import * as ImagePicker from "expo-image-picker";   // ← NEW
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { validateStudentForm } from "../../utils/studentValidation";

import api from "../../services/api";

export default function EditStudentScreen({ navigation, route }) {
  const { studentId } = route.params || {};

  const [fullName, setFullName] = useState("");
  const [nic, setNic] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [university, setUniversity] = useState("");

  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");

  const [monthlyRent, setMonthlyRent] = useState("");
  const [keyMoneyAmount, setKeyMoneyAmount] = useState("");

  const [status, setStatus] = useState("active");
  const [admissionDate, setAdmissionDate] = useState(null);
  const [leavingDate, setLeavingDate] = useState(null);

  const [showAdmissionPicker, setShowAdmissionPicker] = useState(false);
  const [showLeavingPicker, setShowLeavingPicker] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const insets = useSafeAreaInsets();
  const [errors, setErrors] = useState({});

  // ==================== IMAGE STATES ====================
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "Select date";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const normalizeStatus = (value) => {
    return String(value || "active").toLowerCase() === "inactive" ? "inactive" : "active";
  };

  // ==================== PICK IMAGE ====================
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.log("Image picker error:", error);
      Alert.alert("Error", "Failed to open gallery.");
    }
  };
  // ====================================================

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/students/${studentId}`);
      const student = res.data?.student || res.data;

      if (!student) {
        Alert.alert("Error", "Student data not found.");
        navigation.goBack();
        return;
      }

      setFullName(student.fullName || "");
      setNic(student.nic || "");
      setPhone(student.phone || "");
      setWhatsapp(student.whatsapp || "");
      setAddress(student.address || "");
      setUniversity(student.university || "");
      setParentName(student.parentName || "");
      setParentPhone(student.parentPhone || "");
      setStatus(normalizeStatus(student.status));
      setAdmissionDate(student.admissionDate ? new Date(student.admissionDate) : null);
      setLeavingDate(student.leavingDate ? new Date(student.leavingDate) : null);
      setMonthlyRent(student.monthlyRent ? student.monthlyRent.toString() : "");
      setKeyMoneyAmount(student.keyMoneyAmount ? student.keyMoneyAmount.toString() : "");

      // Save current image URL
      setCurrentImageUrl(student.imageUrl || "");
    } catch (error) {
      console.log("Fetch student error:", error?.response?.data || error.message);
      Alert.alert("Error", "Failed to load student details.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!studentId) {
      Alert.alert("Error", "Student ID is missing.");
      navigation.goBack();
      return;
    }
    fetchStudent();
  }, [studentId]);

    const validate = () => {
    const formData = {
      fullName,
      nic,
      phone,
      whatsapp,
      address,
      university,
      parentName,
      parentPhone,
      status,
      admissionDate,
      leavingDate,
      monthlyRent,
      keyMoneyAmount,
    };

    const validationErrors = validateStudentForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.values(validationErrors)[0];
      Alert.alert("Error", firstError);
      return false;
    }

    return true;
  };

      const handleUpdate = async () => {
    if (!validate()) return;

    try {
      setSaving(true);

      const formData = new FormData();

      // Append all text fields (exactly like AddStudentScreen)
      formData.append("fullName", fullName.trim());
      formData.append("nic", nic.trim());
      formData.append("phone", phone.trim());
      formData.append("whatsapp", whatsapp.trim());
      formData.append("address", address.trim());
      formData.append("university", university.trim());
      formData.append("parentName", parentName.trim());
      formData.append("parentPhone", parentPhone.trim());
      formData.append("status", status);
      formData.append("admissionDate", admissionDate ? admissionDate.toISOString() : "");
      if (leavingDate) formData.append("leavingDate", leavingDate.toISOString());
      formData.append("monthlyRent", monthlyRent);
      formData.append("keyMoneyAmount", keyMoneyAmount);

      // Append new image ONLY if user selected one
      if (selectedImage) {
        formData.append("image", {
          uri: selectedImage.uri,
          type: selectedImage.mimeType || "image/jpeg",
          name: selectedImage.fileName || `student_edit_${Date.now()}.jpg`,
        });
      }

      // ←←← THIS IS THE IMPORTANT PART (matches your working AddStudentScreen)
      await api.put(`/api/students/${studentId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Success", "Student updated successfully.");
      navigation.goBack();
    } catch (error) {
      console.log("Update student error:", error?.response?.data || error.message);
      const msg = error?.response?.data?.message || "Failed to update student.";
      Alert.alert("Error", msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={["#F4FBF8", "#BFE5DB"]} style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#58A895" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#F4FBF8", "#BFE5DB"]} style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topBtn}>
            <Ionicons name="arrow-back" size={24} color="#5A5A5A" />
          </TouchableOpacity>
        </View>

        <Text style={styles.screenTitle}>Edit Student Details</Text>

        {/* ==================== IMAGE SECTION ==================== */}
        <View style={styles.imageCard}>
          <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage.uri }} style={styles.profileImage} />
            ) : currentImageUrl ? (
              <Image source={{ uri: currentImageUrl }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderContainer}>
                <Ionicons name="camera-outline" size={50} color="#58A895" />
                <Text style={styles.placeholderText}>Add Profile Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {(selectedImage || currentImageUrl) && (
            <TouchableOpacity onPress={pickImage} style={styles.changePhotoBtn}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          )}
        </View>
        {/* Personal Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal information</Text>
          {/* ... your existing personal fields (unchanged) ... */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.half]}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={[styles.input, errors.fullName && styles.inputError]}
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: "" }));
                }}
              />
              {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
            </View>

            <View style={[styles.inputGroup, styles.half]}>
              <Text style={styles.label}>NIC</Text>
              <TextInput
                style={[styles.input, errors.nic && styles.inputError]}
                value={nic}
                onChangeText={(text) => {
                  setNic(text);
                  if (errors.nic) setErrors((prev) => ({ ...prev, nic: "" }));
                }}
                autoCapitalize="characters"
              />
              {errors.nic ? <Text style={styles.errorText}>{errors.nic}</Text> : null}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
              }}
              keyboardType="phone-pad"
            />
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Whatsapp Number</Text>
            <TextInput
              style={[styles.input, errors.whatsapp && styles.inputError]}
              value={whatsapp}
              onChangeText={(text) => {
                setWhatsapp(text);
                if (errors.whatsapp) setErrors((prev) => ({ ...prev, whatsapp: "" }));
              }}
              keyboardType="phone-pad"
            />
            {errors.whatsapp ? <Text style={styles.errorText}>{errors.whatsapp}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, errors.address && styles.inputError]}
              value={address}
              onChangeText={(text) => {
                setAddress(text);
                if (errors.address) setErrors((prev) => ({ ...prev, address: "" }));
              }}
            />
            {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
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

        {/* ==================== NEW PAYMENT CARD ==================== */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Monthly Rent (LKR)</Text>
            <TextInput
              style={[styles.input, errors.monthlyRent && styles.inputError]}
              value={monthlyRent}
              onChangeText={(text) => {
                setMonthlyRent(text);
                if (errors.monthlyRent) setErrors((prev) => ({ ...prev, monthlyRent: "" }));
              }}
              keyboardType="numeric"
              placeholder="15000"
            />
            {errors.monthlyRent ? <Text style={styles.errorText}>{errors.monthlyRent}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Key Money (LKR)</Text>
            <TextInput
              style={[styles.input, errors.keyMoneyAmount && styles.inputError]}
              value={keyMoneyAmount}
              onChangeText={(text) => {
                setKeyMoneyAmount(text);
                if (errors.keyMoneyAmount) setErrors((prev) => ({ ...prev, keyMoneyAmount: "" }));
              }}
              keyboardType="numeric"
              placeholder="30000"
            />
            {errors.keyMoneyAmount ? <Text style={styles.errorText}>{errors.keyMoneyAmount}</Text> : null}
          </View>
        </View>
        {/* =========================================================== */}

        {/* Parent Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Parent Details</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={[styles.input, errors.parentName && styles.inputError]}
              value={parentName}
              onChangeText={(text) => {
                setParentName(text);
                if (errors.parentName) setErrors((prev) => ({ ...prev, parentName: "" }));
              }}
            />
            {errors.parentName ? <Text style={styles.errorText}>{errors.parentName}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={[styles.input, errors.parentPhone && styles.inputError]}
              value={parentPhone}
              onChangeText={(text) => {
                setParentPhone(text);
                if (errors.parentPhone) setErrors((prev) => ({ ...prev, parentPhone: "" }));
              }}
              keyboardType="phone-pad"
            />
            {errors.parentPhone ? <Text style={styles.errorText}>{errors.parentPhone}</Text> : null}
          </View>
        </View>

        {/* Student Status */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Student Status</Text>
          <View style={styles.inputGroup}>
    <View style={styles.labelRow}>
      <Text style={styles.label}>Admission Date</Text>

      {admissionDate && (
        <TouchableOpacity
          onPress={() => {
            setAdmissionDate(null);
            if (errors.admissionDate) {
              setErrors((prev) => ({ ...prev, admissionDate: "" }));
            }
          }}
        >
          <Text style={styles.clearDateText}>Clear</Text>
        </TouchableOpacity>
      )}
    </View>

    <TouchableOpacity
      style={[styles.dateInput, errors.admissionDate && styles.inputError]}
      onPress={() => setShowAdmissionPicker(true)}
    >
      <Text style={[styles.dateText, !admissionDate && { color: "#999" }]}>
        {admissionDate ? formatDate(admissionDate) : "Select admission date"}
      </Text>
      <Ionicons name="calendar-outline" size={18} color="#666" />
    </TouchableOpacity>

    {errors.admissionDate ? (
      <Text style={styles.errorText}>{errors.admissionDate}</Text>
    ) : null}
  </View>

  <View style={styles.inputGroup}>
    <View style={styles.labelRow}>
      <Text style={styles.label}>Leaving Date</Text>

      {leavingDate && (
        <TouchableOpacity
          onPress={() => {
            setLeavingDate(null);
            if (errors.leavingDate) {
              setErrors((prev) => ({ ...prev, leavingDate: "" }));
            }
          }}
        >
          <Text style={styles.clearDateText}>Clear</Text>
        </TouchableOpacity>
      )}
    </View>

    <TouchableOpacity
      style={[styles.dateInput, errors.leavingDate && styles.inputError]}
      onPress={() => setShowLeavingPicker(true)}
    >
      <Text style={[styles.dateText, !leavingDate && { color: "#999" }]}>
        {leavingDate ? formatDate(leavingDate) : "Select leaving date"}
      </Text>
      <Ionicons name="calendar-outline" size={18} color="#666" />
    </TouchableOpacity>

    {errors.leavingDate ? (
      <Text style={styles.errorText}>{errors.leavingDate}</Text>
    ) : null}
  </View>

  <View style={styles.inputGroup}>
    <Text style={styles.label}>Status</Text>
    <View style={styles.statusRow}>
      <TouchableOpacity
        style={[
          styles.statusBtn,
          status === "active" && styles.statusBtnActive,
          errors.status && styles.inputError,
        ]}
        onPress={() => {
          setStatus("active");
          if (errors.status) {
            setErrors((prev) => ({ ...prev, status: "" }));
          }
        }}
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
          errors.status && styles.inputError,
        ]}
        onPress={() => {
          setStatus("inactive");
          if (errors.status) {
            setErrors((prev) => ({ ...prev, status: "" }));
          }
        }}
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

    {errors.status ? (
      <Text style={styles.errorText}>{errors.status}</Text>
    ) : null}
  </View>
</View>
        

        <View style={styles.bottomButtonRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.bottomCancelBtn}>
            <Text style={styles.bottomCancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleUpdate} style={styles.bottomSaveBtn} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.bottomSaveText}>Save</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date Pickers (unchanged) */}
      {showAdmissionPicker && (
        <DateTimePicker
          value={admissionDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowAdmissionPicker(false);
            if (event.type === "set" && selectedDate) setAdmissionDate(selectedDate);
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
            if (event.type === "set" && selectedDate) setLeavingDate(selectedDate);
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
errorText: {
  color: "#D64545",
  fontSize: 12,
  marginTop: 4,
  marginLeft: 2,
},
inputError: {
  borderColor: "#D64545",
},
imageCard: {
    alignItems: "center",
    marginBottom: 20,
  },
  imageContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#58A895",
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderContainer: {
    alignItems: "center",
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: "#58A895",
    fontWeight: "600",
  },
  changePhotoBtn: {
    marginTop: 10,
  },
  changePhotoText: {
    color: "#58A895",
    fontWeight: "700",
    fontSize: 15,
  },
});


