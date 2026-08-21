import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import api from "../../services/api";

export default function ContractHistoryScreen() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContracts = async () => {
    try {
      const res = await api.get("/api/contracts");

      const today = new Date();

      const expired = res.data
        .filter((item) => {
          const end = new Date(item.endDate);
          return end < today; // Only expired contracts
        })
        .map((item) => ({
          id: item._id,
          name: item.studentName,
          room: `Room ${item.roomNumber}`,
          endDate: new Date(item.endDate).toDateString(),
        }));

      setContracts(expired);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>{item.name}</Text>
        <View style={styles.expiredBadge}>
          <Text style={styles.expiredText}>EXPIRED</Text>
        </View>
      </View>

      <Text style={styles.cardRoom}>{item.room}</Text>

      <View style={styles.cardFooter}>
        <Text style={styles.dateLabel}>Ended on</Text>
        <Text style={styles.cardDate}>{item.endDate}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

     <LinearGradient
  colors={["#E6F2EF", "#BFDAD5"]}
  style={[styles.gradient, styles.container]}
>
        <FlatList
          data={contracts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.container,
            contracts.length === 0 && { flexGrow: 1, justifyContent: "center" },
          ]}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Contract History</Text>
              <Text style={styles.headerSubtitle}>
                Expired contracts archive
              </Text>
            </View>
          }
          ListEmptyComponent={
            !loading && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No expired contracts yet</Text>
                <Text style={styles.emptySubtitle}>
                  All active contracts will appear here once they expire
                </Text>
              </View>
            )
          }
          ListFooterComponent={
            loading ? (
              <ActivityIndicator
                size="large"
                color="#ffffff"
                style={{ marginTop: 40 }}
              />
            ) : null
          }
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  gradient: {
    flex: 1, // ✅ important
  },

  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 30,
  },

  header: {
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1F2937", // ✅ dark like your other screens
  },

  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  cardName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },

  expiredBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },

  expiredText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },

  cardRoom: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 12,
  },

  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 10,
  },

  dateLabel: {
    fontSize: 12,
    color: "#94A3B8",
  },

  cardDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },

  emptyContainer: {
    flex: 1, // ✅ centers properly
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 6,
  },

  emptySubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    paddingHorizontal: 30,
  },
});