import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const GREEN = "#3F9D86";


const API_URL = "http://192.168.1.4:5000/api/auth/signup";



export default function SignupScreen({ navigation }) {

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {

    if (!email || !username || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(API_URL, {
        name: username,   
        email: email,
        password: password
      });

      Alert.alert("Success", "Account created successfully");

      navigation.navigate("Login");

    }catch (error) {
  console.log("FULL ERROR:", error);
  console.log("RESPONSE:", error.response);
  console.log("DATA:", error.response?.data);

  Alert.alert("Signup Failed", "Check console logs");
}

    setLoading(false);
  };

  return (
    <ImageBackground
      source={require("../../assets/Hostel.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <View style={styles.centerWrap}>
        <View style={styles.card}>

          <Text style={styles.hostelName}>සිතුලිය Girls’ Hostel</Text>

          <Text style={styles.bigTitle}>GET STARTED</Text>
          <Text style={styles.subTitle}>
            Create your account to start managing
          </Text>

          {/* Email */}
          <View style={styles.inputWrap}>
            <MaterialIcons name="mail-outline" size={18} color="#9AA0A6" style={styles.leftIcon} />
            <TextInput
              placeholder="Email address"
              placeholderTextColor="#9AA0A6"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Username */}
          <View style={styles.inputWrap}>
            <MaterialIcons name="person-outline" size={18} color="#9AA0A6" style={styles.leftIcon} />
            <TextInput
              placeholder="Username"
              placeholderTextColor="#9AA0A6"
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View style={styles.inputWrap}>
            <MaterialIcons name="lock-outline" size={18} color="#9AA0A6" style={styles.leftIcon} />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#9AA0A6"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!show}
            />

            <TouchableOpacity onPress={() => setShow(!show)} style={styles.rightIconBtn}>
              <Ionicons name={show ? "eye-off-outline" : "eye-outline"} size={18} color="#9AA0A6" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleSignup}>
            {loading ? (
              <ActivityIndicator color="#fff"/>
            ) : (
              <Text style={styles.primaryBtnText}>Create Account →</Text>
            )}
          </TouchableOpacity>

          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.bottomLink}>Sign in</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)"
  },

  centerWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 22
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 24,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8
  },

  hostelName: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 14,
    color: "#111"
  },

  bigTitle: {
    fontSize: 22,
    letterSpacing: 1.2,
    fontWeight: "700",
    color: "#111"
  },

  subTitle: {
    marginTop: 6,
    marginBottom: 18,
    fontSize: 12,
    color: "#7B7B7B"
  },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 10,
    marginBottom: 12,
    backgroundColor: "#fff"
  },

  leftIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 13, color: "#111" },
  rightIconBtn: { paddingLeft: 8, paddingVertical: 6 },

  primaryBtn: {
    backgroundColor: GREEN,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6
  },

  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16
  },

  bottomText: {
    fontSize: 12,
    color: "#7B7B7B"
  },

  bottomLink: {
    fontSize: 12,
    color: GREEN,
    fontWeight: "600"
  }
});