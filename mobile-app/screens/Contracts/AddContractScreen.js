import React, { useState } from "react";
import { ScrollView } from "react-native";  
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { validateContract } from "../../utils/validation"; // ✅ NEW

export default function AddContractScreen() {
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [moveInDate, setMoveInDate] = useState(null);
  const [duration, setDuration] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const [errors, setErrors] = useState({});

  // ✅ END DATE CALCULATION (unchanged)
  const calculateEndDate = (date, months) => {
    if (!date || !months) return;

    let newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + parseInt(months));

    setEndDate(newDate.toDateString());
  };

  // ✅ SAVE
  const saveContract = async () => {
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
      Alert.alert("Please fix errors before saving");
      return;
    }

    try {
      await axios.post("http://192.168.8.101:5000/api/contracts/add", {
        studentName: name,
        studentId,
        contactNumber,
        roomNumber,
        moveInDate,
        durationMonths: Number(duration)
      });

      Alert.alert("Saved Successfully");
    } catch (err) {
      Alert.alert(err.response?.data?.message || "Error saving");
    }
  };

  return (
    <ScrollView
  style={{ flex: 1 }}
  contentContainerStyle={styles.container}
  showsVerticalScrollIndicator={false}
  keyboardShouldPersistTaps="handled"
>
      <Text style={styles.header}>Add New Contract</Text>

      {/* NAME */}
      <Text style={styles.label}>
        Student Name <Text style={styles.star}>*</Text>
      </Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      {errors.name ? <Text style={styles.error}>{errors.name}</Text> : null}

      {/* ID */}
      <Text style={styles.label}>
        ID <Text style={styles.star}>*</Text>
      </Text>
      <TextInput
        style={styles.input}
        value={studentId}
        onChangeText={setStudentId}
      />
      {errors.studentId ? <Text style={styles.error}>{errors.studentId}</Text> : null}

      {/* CONTACT */}
      <Text style={styles.label}>
        Contact Number <Text style={styles.star}>*</Text>
      </Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={contactNumber}
        onChangeText={setContactNumber}
      />
      {errors.contactNumber ? <Text style={styles.error}>{errors.contactNumber}</Text> : null}

      {/* ROOM */}
      <Text style={styles.label}>
        Room Number <Text style={styles.star}>*</Text>
      </Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={roomNumber}
        onChangeText={setRoomNumber}
      />
      {errors.roomNumber ? <Text style={styles.error}>{errors.roomNumber}</Text> : null}

      {/* DATE */}
      <Text style={styles.label}>
        Move-in Date <Text style={styles.star}>*</Text>
      </Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)}>
        <Text style={{ color: moveInDate ? "#000" : "#aaa" }}>
          {moveInDate ? new Date(moveInDate).toDateString() : "DD/MM/YYYY"}
        </Text>
      </TouchableOpacity>
      {errors.date ? <Text style={styles.error}>{errors.date}</Text> : null}

      {showPicker && (
        <DateTimePicker
          value={moveInDate ? new Date(moveInDate) : new Date()}
          mode="date"
          minimumDate={new Date()}
          onChange={(e, date) => {
            setShowPicker(false);
            if (date) {
              setMoveInDate(date);
              calculateEndDate(date, duration);
            }
          }}
        />
      )}
      {errors.moveInDate ? (
  <Text style={styles.error}>{errors.moveInDate}</Text>
) : null}

      {/* DURATION */}
      <Text style={styles.label}>
        Contract Duration <Text style={styles.star}>*</Text>
      </Text>
      <View style={styles.row}>
        <TextInput
          style={styles.durationInput}
          keyboardType="numeric"
          value={duration}
          onChangeText={(val) => {
            setDuration(val);
            calculateEndDate(moveInDate, val);
          }}
        />
        <Text style={styles.month}>Months</Text>
      </View>
      {errors.duration ? (
        <Text style={styles.error}>{errors.duration}</Text>
      ) : null}

      {/* END DATE */}
      <Text style={styles.label}>End Date</Text>
      <View style={styles.input}>
        <Text style={{ color: "#aaa" }}>
          {endDate ? endDate : "Auto-Calculated"}
        </Text>
      </View>

      {/* SAVE */}
      <TouchableOpacity style={styles.button} onPress={saveContract}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#E6F2EF" },
  header: { textAlign: "center", fontSize: 18, marginBottom: 20 },
  label: { marginTop: 10 },
  star: { color: "red" },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginTop: 5
  },
  row: { flexDirection: "row", alignItems: "center" },
  durationInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    width: 80,
    marginTop: 5
  },
  month: { marginLeft: 10 },
  error: { color: "red", fontSize: 12, marginTop: 2 },
  button: {
    backgroundColor: "#3FA58D",
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    alignItems: "center"
  },
  buttonText: { color: "#fff" }
});