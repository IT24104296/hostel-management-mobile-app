import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
  Image,
  Modal                    // ← NEW
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import api from "../../services/api";

export default function StudentProfileScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { studentId } = route.params || {};

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullImage, setShowFullImage] = useState(false);

  const fetchStudent = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/api/students/${studentId}`);
      const data = res.data?.student || res.data;

      if (!data) {
        Alert.alert("Error", "Student not found.");
        navigation.goBack();
        return;
      }

      setStudent(data);
    } catch (error) {
      console.log("Fetch student profile error:", error?.response?.data || error.message);
      Alert.alert("Error", "Failed to load student profile.");
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

  const formatDate = (date) => {
    if (!date) return "Not available";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "Not available";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const makePhoneNumber = (number) => {
    if (!number) return "";
    return String(number).replace(/[^\d+]/g, "");
  };

  const handleCall = async (number) => {
    const phone = makePhoneNumber(number);
    if (!phone) {
      Alert.alert("Unavailable", "Phone number is not available.");
      return;
    }
    const url = `tel:${phone}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert("Error", "Phone dialer could not be opened.");
    } catch (error) {
      Alert.alert("Error", "Failed to open phone dialer.");
    }
  };

  const handleWhatsApp = async (number) => {
    const phone = makePhoneNumber(number);
    if (!phone) {
      Alert.alert("Unavailable", "Whatsapp number is not available.");
      return;
    }

    let whatsappNumber = phone;
    if (whatsappNumber.startsWith("+")) {
      whatsappNumber = whatsappNumber.substring(1);
    } else if (whatsappNumber.startsWith("0")) {
      whatsappNumber = `94${whatsappNumber.substring(1)}`;
    }

    const appUrl = `whatsapp://send?phone=${whatsappNumber}`;
    const webUrl = `https://wa.me/${whatsappNumber}`;

    try {
      const supported = await Linking.canOpenURL(appUrl);
      if (supported) {
        await Linking.openURL(appUrl);
      } else {
        const webSupported = await Linking.canOpenURL(webUrl);
        if (webSupported) await Linking.openURL(webUrl);
        else Alert.alert("Error", "WhatsApp could not be opened.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open WhatsApp.");
    }
  };

  const normalizedStatus =
    String(student?.status || "active").toLowerCase() === "inactive"
      ? "Inactive"
      : "Active";

  const roomNumber =
    student?.room?.roomNumber ||
    student?.room?.RoomNumber ||
    student?.roomNumber ||
    (typeof student?.room === "string" ? student.room : "Not Assigned");

  const InfoCard = ({ title, children }) => (
    <View style={styles.infoCard}>
      <Text style={styles.infoCardTitle}>{title}</Text>
      {children}
    </View>
  );

  const RowItem = ({ label, value, icon, valueStyle }) => (
    <View style={styles.rowItem}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowColon}>:</Text>
        <Text style={[styles.rowValue, valueStyle]}>{value || "Not available"}</Text>
      </View>
      {icon ? <View style={styles.rowRight}>{icon}</View> : null}
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={["#F4FBF8", "#BFE5DB"]} style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#58A895" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#F4FBF8", "#BFE5DB"]}
      style={[styles.container, { paddingTop: insets.top + 8 }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top row */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color="#555" />
          </TouchableOpacity>
        </View>

        <Text style={styles.screenTitle}>Student Profile</Text>

        <View style={styles.summaryCard}>
          <TouchableOpacity 
            onPress={() => student?.imageUrl && setShowFullImage(true)}
            activeOpacity={0.9}
          >
            <View style={styles.avatarWrap}>
              {student?.imageUrl ? (
                <Image
                  source={{ uri: student.imageUrl }}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.avatarEmoji}>👨‍🎓</Text>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.summaryTextWrap}>
            <Text style={styles.studentName}>{student?.fullName || "Unnamed Student"}</Text>
            <Text style={styles.roomText}>Room {roomNumber}</Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              normalizedStatus === "Active" ? styles.activeBadge : styles.inactiveBadge,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                normalizedStatus === "Active"
                  ? styles.activeBadgeText
                  : styles.inactiveBadgeText,
              ]}
            >
              {normalizedStatus}
            </Text>
          </View>
        </View>

        {/* Rest of your code remains exactly the same */}
        <InfoCard title="Personal Information">
          <RowItem label="Name" value={student?.fullName} />
          <RowItem label="Student ID" value={student?.studentId} />
          <RowItem label="Address" value={student?.address} />
          <RowItem label="University" value={student?.university || "Not available"} />
          <RowItem label="NIC" value={student?.nic} />
        </InfoCard>

        <InfoCard title="Contact Information">
          <RowItem
            label="Phone"
            value={student?.phone}
            icon={
              <TouchableOpacity onPress={() => handleCall(student?.phone)}>
                <Ionicons name="call" size={20} color="#111" />
              </TouchableOpacity>
            }
          />
          <RowItem
            label="Whatsapp"
            value={student?.whatsapp || "Not available"}
            icon={
              <TouchableOpacity onPress={() => handleWhatsApp(student?.whatsapp)}>
                <Ionicons name="logo-whatsapp" size={22} color="#111" />
              </TouchableOpacity>
            }
          />
        </InfoCard>

        <InfoCard title="Parent Details">
          <RowItem label="Parent Name" value={student?.parentName} />
          <RowItem
            label="Parent Phone"
            value={student?.parentPhone}
            icon={
              <TouchableOpacity onPress={() => handleCall(student?.parentPhone)}>
                <Ionicons name="call" size={20} color="#111" />
              </TouchableOpacity>
            }
          />
        </InfoCard>

        <InfoCard title="Student Status">
          <RowItem label="Admission Date" value={formatDate(student?.admissionDate)} />
          <RowItem label="Leaving Date" value={formatDate(student?.leavingDate)} />
          <RowItem
            label="Status"
            value={normalizedStatus}
            valueStyle={
              normalizedStatus === "Active" ? styles.activeTextInline : styles.inactiveTextInline
            }
          />
        </InfoCard>

        <InfoCard title="Payment Information">
          <RowItem
            label="Monthly Rent"
            value={student?.monthlyRent ? `LKR ${student.monthlyRent}` : "Not set"}
          />
          <RowItem
            label="Key Money"
            value={student?.keyMoneyAmount ? `LKR ${student.keyMoneyAmount}` : "Not set"}
          />
          <RowItem
            label="Next Due Date"
            value={
              student?.nextDueDate
                ? formatDate(student.nextDueDate)
                : "Not set yet (record first payment)"
            }
            valueStyle={{ fontWeight: "700", color: student?.nextDueDate ? "#2C7C68" : "#D64545" }}
          />
        </InfoCard>

        <TouchableOpacity
          style={styles.editBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("EditStudent", { studentId })}
        >
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
      <Modal
        visible={showFullImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFullImage(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setShowFullImage(false)}>
            <Ionicons name="close-circle" size={40} color="#fff" />
          </TouchableOpacity>

          {student?.imageUrl && (
            <Image
              source={{ uri: student.imageUrl }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // ==================== ALL YOUR ORIGINAL STYLES + NEW IMAGE STYLE ====================
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 20,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconBtn: {
    padding: 6,
  },

  screenTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
    textAlign: "center",
    marginBottom: 14,
  },

  summaryCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#72B5A5",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 3,
    borderColor: "#58A895",
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  avatarEmoji: {
    fontSize: 45,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalClose: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  fullImage: {
    width: "100%",
    height: "80%",
  },

  summaryTextWrap: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  roomText: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBadge: {
    backgroundColor: "#D8F2E7",
  },
  inactiveBadge: {
    backgroundColor: "#FDE2DE",
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  activeBadgeText: {
    color: "#2C7C68",
  },
  inactiveBadgeText: {
    color: "#C14D42",
  },

  // ... rest of your styles (unchanged) ...
  infoCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  infoCardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
    marginBottom: 12,
  },

  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  rowLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  rowLabel: {
    width: 95,
    fontSize: 14,
    color: "#555",
    fontWeight: "600",
  },
  rowColon: {
    width: 12,
    fontSize: 14,
    color: "#555",
    fontWeight: "600",
  },
  rowValue: {
    flex: 1,
    fontSize: 14,
    color: "#222",
    fontWeight: "500",
    lineHeight: 20,
  },
  rowRight: {
    marginLeft: 10,
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },

  activeTextInline: {
    color: "#2C7C68",
    fontWeight: "700",
  },
  inactiveTextInline: {
    color: "#C14D42",
    fontWeight: "700",
  },

  editBtn: {
    alignSelf: "center",
    minWidth: 82,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#58A895",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  editBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});