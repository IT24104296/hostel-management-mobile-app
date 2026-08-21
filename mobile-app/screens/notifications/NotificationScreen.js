import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import api from "../../services/api";

export default function NotificationScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/api/notifications");
      setNotifications(res.data.notifications || []);
    } catch (error) {
      console.error("Fetch notifications error:", error);
      Alert.alert("Error", "Failed to load notifications");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  // ====================== MARK ALL AS READ ======================
  const markAllAsRead = async () => {
    Alert.alert(
      "Mark All as Read",
      "Mark all notifications as read?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark All",
          onPress: async () => {
            try {
              await api.put("/api/notifications/mark-all-read");
              setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true }))
              );
              Alert.alert("Success", "All notifications marked as read");
            } catch (error) {
              Alert.alert("Error", "Failed to mark all as read");
            }
          },
        },
      ]
    );
  };

  // ====================== CLEAR ALL ======================
  const clearAllNotifications = async () => {
    Alert.alert(
      "Clear All Notifications",
      "This will permanently delete ALL notifications.\n\nAre you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete("/api/notifications/all");
              setNotifications([]);
              Alert.alert("Success", "All notifications cleared");
            } catch (error) {
              Alert.alert("Error", "Failed to clear notifications");
            }
          },
        },
      ]
    );
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "payment_due":
        return { name: "calendar", color: "#F59E0B" };
      case "overdue":
        return { name: "alert-circle", color: "#EF4444" };
      case "payment_received":
        return { name: "checkmark-circle", color: "#10B981" };
      default:
        return { name: "notifications", color: "#58A895" };
    }
  };

  const renderNotification = ({ item }) => {
    const icon = getIcon(item.type);
    const isRead = item.isRead;

    return (
      <TouchableOpacity
        style={[styles.notificationCard, isRead && styles.readCard]}
        onPress={() => {
          markAsRead(item._id);

          // ✅ FIXED: Use _id from populated relatedStudent
          if (item.relatedStudent?._id) {
            navigation.navigate("StudentPaymentDetail", {
              studentId: item.relatedStudent._id,
            });
          } else if (item.relatedStudent) {
            // Fallback if it's just an ID string
            navigation.navigate("StudentPaymentDetail", {
              studentId: item.relatedStudent,
            });
          }
        }}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={icon.name} size={28} color={icon.color} />
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, !isRead && styles.unreadTitle]}>
            {item.title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.time}>
            {new Date(item.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        {!isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={["#F4FBF8", "#BFE5DB"]} style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton} onPress={markAllAsRead}>
          <Ionicons name="checkmark-done-outline" size={20} color="#10B981" />
          <Text style={styles.actionButtonText}>Mark All Read</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.clearButton]} onPress={clearAllNotifications}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
          <Text style={styles.actionButtonText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#58A895" style={{ marginTop: 100 }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderNotification}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No notifications yet</Text>
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 6, marginRight: 12 },
  title: { fontSize: 24, fontWeight: "700", color: "#111" },

  actionBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  clearButton: {
    backgroundColor: "#fff",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  listContainer: { paddingHorizontal: 16, paddingBottom: 20 },

  notificationCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  readCard: { opacity: 0.75 },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F4F2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  content: { flex: 1 },
  title: { fontSize: 16, fontWeight: "600", color: "#111", marginBottom: 4 },
  unreadTitle: { fontWeight: "700" },
  message: { fontSize: 14, color: "#555", lineHeight: 20 },
  time: { fontSize: 12, color: "#888", marginTop: 8 },

  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EF4444",
    alignSelf: "center",
    marginLeft: 8,
  },

  emptyText: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
    marginTop: 100,
  },
});