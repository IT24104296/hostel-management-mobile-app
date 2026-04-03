import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import API_URL from "../services/api";

export default function PaymentListScreen() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchPayments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/payments`);
      const data = await response.json();

      const grouped = {};

      data.forEach((item) => {
        if (!grouped[item.studentId]) {
          grouped[item.studentId] = {
            studentId: item.studentId,
            roomNumber: item.roomNumber,
            totalPaid: 0,
            payments: [],
            status: item.status,
          };
        }

        grouped[item.studentId].totalPaid += item.amount;
        grouped[item.studentId].payments.push(item);
      });

      const result = Object.values(grouped);
      setPayments(result);
    } catch (error) {
      console.log("Error fetching payments:", error);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((item) => {
    const matchRoom = item.roomNumber
      .toLowerCase()
      .includes(search.toLowerCase());

    if (filter === "all") return matchRoom;
    return matchRoom && item.status.toLowerCase() === filter;
  });

  const renderCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.studentName}>{item.studentId}</Text>
        <Text
          style={[
            styles.badge,
            item.status === "paid" ? styles.paidBadge : styles.dueBadge,
          ]}
        >
          {item.status}
        </Text>
      </View>

      <Text style={styles.subText}>Room {item.roomNumber}</Text>

      <Text style={styles.totalText}>
        Total Paid: Rs. {item.totalPaid}
      </Text>

      <Text style={styles.totalText}>
        Payments: {item.payments.length}
      </Text>

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#555"
        style={styles.arrow}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons name="menu" size={22} color="#444" />
        <Text style={styles.title}>Payment Management</Text>
        <View style={styles.headerIcons}>
          <Ionicons name="notifications-outline" size={20} color="#444" />
          <Ionicons name="person-circle-outline" size={26} color="#777" />
        </View>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#999" />
        <TextInput
          placeholder="Search by room number..."
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <Text style={styles.countText}>{filteredPayments.length} Students</Text>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === "all" && styles.activeFilter]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={filter === "all" ? styles.activeFilterText : styles.filterText}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filter === "paid" && styles.activeFilter]}
          onPress={() => setFilter("paid")}
        >
          <Text
            style={filter === "paid" ? styles.activeFilterText : styles.filterText}
          >
            Paid
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filter === "due" && styles.activeFilter]}
          onPress={() => setFilter("due")}
        >
          <Text
            style={filter === "due" ? styles.activeFilterText : styles.filterText}
          >
            Due
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredPayments}
        keyExtractor={(item) => item.studentId}
        renderItem={renderCard}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dff1ec",
    paddingTop: 55,
    paddingHorizontal: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    flex: 1,
    marginLeft: 16,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  searchBox: {
    marginTop: 18,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
  },
  countText: {
    marginTop: 14,
    color: "#555",
    fontSize: 13,
  },
  filterRow: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 12,
  },
  filterBtn: {
    backgroundColor: "#e7e7e7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: "#7fc7a8",
  },
  filterText: {
    color: "#555",
  },
  activeFilterText: {
    color: "#fff",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    position: "relative",
    elevation: 2,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  studentName: {
    fontSize: 16,
    fontWeight: "700",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    fontSize: 11,
    overflow: "hidden",
  },
  paidBadge: {
    backgroundColor: "#d6f4dc",
    color: "#2a9d55",
  },
  dueBadge: {
    backgroundColor: "#ffd8d8",
    color: "#d62828",
  },
  subText: {
    color: "#666",
    marginTop: 6,
  },
  totalText: {
    marginTop: 6,
    fontSize: 13,
    color: "#333",
  },
  arrow: {
    position: "absolute",
    right: 12,
    top: 35,
  },
});