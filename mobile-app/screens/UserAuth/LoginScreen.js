import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { validateLoginForm } from "../../utils/authValidation";

const GREEN = "#3F9D86";


const API_BASE_URL = "http://192.168.1.4:5000";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
const handleLogin = async () => {
  const errors = validateLoginForm({
    username,
    password,
  });

  if (Object.keys(errors).length > 0) {
    const firstError = Object.values(errors)[0];
    Alert.alert("Validation Error", firstError);
    return;
  }

  try {
    setLoading(true);

    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      username: username.trim(),
      password,
    });

    const token = res?.data?.token;
    const user = res?.data?.user;

    if (!token) {
      Alert.alert("Login failed", "Token not received from server.");
      return;
    }

    await AsyncStorage.setItem("token", token);
    if (user) await AsyncStorage.setItem("user", JSON.stringify(user));

    navigation.reset({
      index: 0,
      routes: [{ name: "AppTabs" }],
    });
  } catch (error) {
    const msg =
      error?.response?.data?.message ||
      "Invalid username or password (or server not running).";
    Alert.alert("Login Failed", msg);
  } finally {
    setLoading(false);
  }
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
          <Text style={styles.hostelName}> සිතුලිය Girls’ Hostel</Text>

          <Text style={styles.bigTitle}>WELCOME BACK</Text>
          <Text style={styles.subTitle}>
            Sign in to your management dashboard.
          </Text>

          {/* Username */}
          <View style={styles.inputWrap}>
            <MaterialIcons
              name="person-outline"
              size={18}
              color="#9AA0A6"
              style={styles.leftIcon}
            />
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
            <MaterialIcons
              name="lock-outline"
              size={18}
              color="#9AA0A6"
              style={styles.leftIcon}
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#9AA0A6"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!show}
            />
            <TouchableOpacity
              onPress={() => setShow(!show)}
              style={styles.rightIconBtn}
            >
              <Ionicons
                name={show ? "eye-off-outline" : "eye-outline"}
                size={18}
                color="#9AA0A6"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => Alert.alert("Info", "Forgot password not added yet.")}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.primaryBtnText}>Sign In →</Text>
            )}
          </TouchableOpacity>

          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Don’t have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.bottomLink}>Sign up</Text>
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
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  centerWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
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
    elevation: 8,
  },

  hostelName: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 14,
    color: "#111",
  },

  bigTitle: {
    fontSize: 22,
    letterSpacing: 1.2,
    fontWeight: "700",
    color: "#111",
  },
  subTitle: {
    marginTop: 6,
    marginBottom: 18,
    fontSize: 12,
    color: "#7B7B7B",
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
    backgroundColor: "#fff",
  },
  leftIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 13, color: "#111" },
  rightIconBtn: { paddingLeft: 8, paddingVertical: 6 },

  forgotBtn: { alignSelf: "flex-end", marginTop: 2, marginBottom: 14 },
  forgotText: { fontSize: 12, color: GREEN },

  primaryBtn: {
    backgroundColor: GREEN,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  bottomText: { fontSize: 12, color: "#7B7B7B" },
  bottomLink: { fontSize: 12, color: GREEN, fontWeight: "600" },
});

