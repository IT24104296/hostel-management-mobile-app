import React from "react";
import  { useCallback, useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Alert } from "react-native";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const API_BASE_URL = "http://192.168.1.4:5000";



export default function HomeScreen({ navigation }) {
  const [students, setStudents] = useState([]);
  const insets = useSafeAreaInsets();

const fetchStudents = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/students`);
    const rawStudents = Array.isArray(res.data) ? res.data : res.data.students || [];
    setStudents(rawStudents);
  } catch (error) {
    console.log("Fetch students error:", error?.response?.data || error.message);
    Alert.alert("Error", "Failed to load dashboard data.");
  }
};

useFocusEffect(
  useCallback(() => {
    fetchStudents();
  }, [])
);
  
  const stats = useMemo(() => {
  const totalStudents = students.length;

  
  
  return {
    totalStudents,
    totalRooms: 19,
    occupied: 10,
    available: 9,
    pendingPayments: 5,
    
  };
}, [students]);

  const QuickCard = ({ title, img, onPress }) => (
    <TouchableOpacity style={styles.quickCard} onPress={onPress} activeOpacity={0.85}>
      <Image source={img} style={styles.quickImg} />
      <Text style={styles.quickText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={["#F4FBF9", "#D9F2EC", "#BFE7DE"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.container, { paddingTop: insets.top + 8 }]}></View>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="menu" size={26} color="#111" />
          </TouchableOpacity>

          <View style={styles.topRight}>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="notifications-outline" onPress={() => navigation.navigate("Notifications")} size={22} color="#111" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="person-circle-outline" onPress={() => navigation.navigate("Profile")} size={26} color="#111" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Greeting */}
        <Text style={styles.welcome}>Welcome Admin!</Text>
        <Text style={styles.hostelName}>සිතුලිය Girls’ Hostel</Text>

        {/* Overview */}
        <Text style={styles.sectionTitle}>OVERVIEW</Text>

        <View style={styles.grid2}>
          <View style={styles.statCard}>
            <View style={styles.statIconCircle}>
              <Ionicons name="people-outline" size={18} color="#2E8B7D" />
            </View>
            <Text style={styles.statNumber}>{stats.totalStudents}</Text>
            <Text style={styles.statLabel}>Total Students</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconCircle}>
              <Ionicons name="business-outline" size={18} color="#2E8B7D" />
            </View>
            <Text style={styles.statNumber}>{stats.totalRooms}</Text>
            <Text style={styles.statLabel}>Total Rooms</Text>
          </View>

          <View style={[styles.statCard, styles.leftAccentRed]}>
            <View style={[styles.statIconCircle, styles.iconRed]}>
              <Ionicons name="bed-outline" size={18} color="#D84C4C" />
            </View>
            <Text style={styles.statNumber}>{stats.occupied}</Text>
            <Text style={styles.statLabel}>Occupied Rooms</Text>
          </View>

          <View style={[styles.statCard, styles.leftAccentGreen]}>
            <View style={[styles.statIconCircle, styles.iconGreen]}>
              <Ionicons name="bed-outline" size={18} color="#2E8B7D" />
            </View>
            <Text style={styles.statNumber}>{stats.available}</Text>
            <Text style={styles.statLabel}>Available Rooms</Text>
          </View>
        </View>

        {/* Pending payments (wide card) */}
        <View style={styles.pendingCard}>
          <View style={styles.pendingLeft}>
            <View style={[styles.pendingIconBox]}>
              <Ionicons name="card-outline" size={18} color="#D1A400" />
            </View>
            <View>
              <Text style={styles.pendingNumber}>{stats.pendingPayments}</Text>
              <Text style={styles.pendingLabel}>Pending Payments</Text>
            </View>
          </View>
        </View>

        {/* Quick Access */}
        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>QUICK ACCESS</Text>

        <View style={styles.quickGrid}>
          <QuickCard
            title="Student Management"
            img={require("../../assets/dashboard/StudentsIcon.png")}
            onPress={() => navigation.navigate("Students")}
          />
          <QuickCard
            title="Room & Occupancy"
            img={require("../../assets/dashboard/RoomIcon.png")}
            onPress={() => navigation.navigate("Rooms")}
          />
          <QuickCard
            title="Payment Management"
            img={require("../../assets/dashboard/PaymentIcon.png")}
            onPress={() => navigation.navigate("Payments")}
          />
          <QuickCard
            title="Reminders & Alerts"
            img={require("../../assets/dashboard/NotificationsIcon.png")}
            onPress={() => navigation.navigate("Notifications")}
          />
          <QuickCard
            title="Financial Reporting"
            img={require("../../assets/dashboard/ReportsIcon.png")}
            onPress={() => navigation.navigate("Reports")}
          />
          <QuickCard
            title="Contract & Stay"
            img={require("../../assets/dashboard/ContractIcon.png")}
            onPress={() => navigation.navigate("Contracts")}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 18},

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  topRight: { flexDirection: "row", gap: 10 },
  iconBtn: { padding: 6, borderRadius: 10 },

  welcome: { marginTop: 10, fontSize: 14, color: "#333" },
  hostelName: { fontSize: 20, fontWeight: "700", color: "#111", marginTop: 2 },

  sectionTitle: {
    marginTop: 16,
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: "700",
    color: "#222",
  },

  grid2: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },

  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  statIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#EAF7F3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statNumber: { fontSize: 22, fontWeight: "800", color: "#111" },
  statLabel: { marginTop: 2, fontSize: 12, color: "#555" },

  leftAccentRed: { borderLeftWidth: 4, borderLeftColor: "#D84C4C" },
  leftAccentGreen: { borderLeftWidth: 4, borderLeftColor: "#2E8B7D" },
  iconRed: { backgroundColor: "#FDECEC" },
  iconGreen: { backgroundColor: "#EAF7F3" },

  pendingCard: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  pendingLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  pendingIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#FFF7D6",
    alignItems: "center",
    justifyContent: "center",
  },
  pendingNumber: { fontSize: 20, fontWeight: "800", color: "#111" },
  pendingLabel: { fontSize: 12, color: "#555", marginTop: 2 },

  quickGrid: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  quickCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  quickImg: { width: 64, height: 64, resizeMode: "contain", marginBottom: 10 },
  quickText: { fontSize: 12, color: "#333", fontWeight: "600", textAlign: "center" },
});