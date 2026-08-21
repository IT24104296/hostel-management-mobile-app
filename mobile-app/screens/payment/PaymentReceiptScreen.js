import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { useSafeAreaInsets } from "react-native-safe-area-context";


export default function PaymentReceiptScreen({ route, navigation }) {
  const { payment, student } = route.params || {}; // Data passed from previous screen
  const insets = useSafeAreaInsets();
  const [generating, setGenerating] = useState(false);

  if (!payment || !student) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Receipt data not found</Text>
      </View>
    );
  }

  const generateReceiptHTML = () => {
    return `
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { font-family: 'Inter', sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
            .receipt { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background: #10b981; color: white; text-align: center; padding: 30px 20px; }
            .check { font-size: 60px; margin-bottom: 10px; }
            .title { font-size: 24px; font-weight: 700; margin: 0; }
            .subtitle { font-size: 15px; opacity: 0.9; margin: 5px 0 0; }
            .content { padding: 25px; }
            .amount-box { background: #ecfdf5; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 25px; }
            .amount { font-size: 32px; font-weight: 700; color: #10b981; margin: 8px 0; }
            .section { margin-bottom: 22px; }
            .section-title { font-size: 15px; font-weight: 600; color: #555; margin-bottom: 8px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 15px; }
            .label { color: #666; }
            .value { font-weight: 600; text-align: right; }
            .footer { text-align: center; font-size: 12px; color: #888; padding: 20px; border-top: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="check">✅</div>
              <h1 class="title">Payment Successful</h1>
              <p class="subtitle"> Sithuliya Girls Hostel</p>
              <p class="subtitle">Payment Management System</p>
            </div>
            <div class="content">
              <div style="text-align:center; margin-bottom:20px;">
                <p style="font-size:13px; color:#666;">${new Date().toLocaleDateString("en-GB")}</p>
                <p style="font-size:15px; font-weight:600; color:#333;">Receipt #${payment._id?.slice(-8) || "TXN" + Math.floor(Math.random()*1000000)}</p>
              </div>

              <div class="amount-box">
                <p style="margin:0; font-size:15px; color:#10b981;">Amount Paid</p>
                <p class="amount">Rs. ${parseFloat(payment.amount).toLocaleString("en-US")}</p>
              </div>

              <div class="section">
                <div class="section-title">Student Details</div>
                <div class="row"><span class="label">Name</span><span class="value">${student.fullName}</span></div>
                <div class="row"><span class="label">Registration No</span><span class="value">${student.studentId}</span></div>
                <div class="row"><span class="label">Room Number</span><span class="value">${student.room?.roomNumber || "—"}</span></div>
                
              </div>

              <div class="section">
                <div class="section-title">Payment Information</div>
                <div class="row"><span class="label">Payment Date</span><span class="value">${new Date(payment.paidDate).toLocaleDateString("en-GB")}</span></div>
                <div class="row"><span class="label">Payment Time</span><span class="value">${new Date(payment.paidDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span></div>
                <div class="row"><span class="label">Payment Method</span><span class="value">${payment.method || "Cash"}</span></div>
                <div class="row"><span class="label">Received By</span><span class="value">${payment.recordedBy || "—"}</span></div>
                <div class="row"><span class="label">Status</span><span class="value" style="color:#10b981; font-weight:700;">Completed</span></div>
              </div>

              ${payment.notes ? `
              <div class="section">
                <div class="section-title">Notes</div>
                <p style="font-size:14px; color:#444;">${payment.notes}</p>
              </div>` : ''}

              <div class="footer">
                This is a computer-generated receipt and does not require a signature.<br>
                Generated on: ${new Date().toLocaleString("en-US")}<br>
                For queries, contact: +94 77 283 4783
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const generateAndSharePDF = async () => {
    setGenerating(true);
    try {
      const html = generateReceiptHTML();
      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("Share not available", "You can still download the receipt.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to generate receipt");
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

      const downloadPDF = async () => {
    setGenerating(true);
    try {
      const html = generateReceiptHTML();
      const { uri } = await Print.printToFileAsync({ html });

      // Open native Share sheet so user can save to Downloads or anywhere
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Save Receipt",
          UTI: "com.adobe.pdf", // for iOS
        });
      } else {
        Alert.alert("Share not available", "PDF generated but cannot share on this device.");
      }
    } catch (error) {
      console.error("Download / Share Error:", error);
      Alert.alert("Error", "Failed to generate receipt. Please try again.");
    } finally {
      setGenerating(false);
    }
  };
  return (
    <LinearGradient colors={["#F4FBF8", "#BFE5DB"]} style={[styles.container, { paddingTop: insets.top  + 8 },{ paddingBottom: insets.top  + 8 }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Receipt Preview */}
        <View style={styles.receiptContainer}>
          <View style={styles.receiptHeader}>
            <Ionicons name="checkmark-circle" size={80} color="#10b981" />
            <Text style={styles.successText}>Payment Successful</Text>
            <Text style={styles.hostelName}>Sithuliya Girls' Hostel</Text>
            <Text style={styles.systemName}>Payment Management System</Text>
          </View>

          <View style={styles.receiptBody}>
            <Text style={styles.receiptNumber}>
              Receipt #{payment._id?.slice(-8) || "TXN00000001"}
            </Text>

            <View style={styles.amountBox}>
              <Text style={styles.amountLabel}>Amount Paid</Text>
              <Text style={styles.amountValue}>
                Rs. {parseFloat(payment.amount).toLocaleString("en-US")}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Student Details</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>{student.fullName}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Registration No</Text>
                <Text style={styles.value}>{student.studentId}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Room Number</Text>
                <Text style={styles.value}>{student.room?.roomNumber || "—"}</Text>
              </View>
              
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Information</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Payment Date</Text>
                <Text style={styles.value}>{new Date(payment.paidDate).toLocaleDateString("en-GB")}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Payment Time</Text>
                <Text style={styles.value}>
                  {new Date(payment.paidDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Payment Method</Text>
                <Text style={styles.value}>{payment.method || "Cash"}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Received By</Text>
                <Text style={styles.value}>{payment.recordedBy || "—"}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Status</Text>
                <Text style={styles.completed}>Completed</Text>
              </View>
            </View>

            {payment.notes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <Text style={styles.notes}>{payment.notes}</Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              This is a computer-generated receipt and does not require a signature.
            </Text>
            <Text style={styles.footerTextSmall}>
              Generated on: {new Date().toLocaleString("en-US")}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.shareBtn} onPress={generateAndSharePDF} disabled={generating}>
          <Ionicons name="share-social-outline" size={24} color="#fff" />
          <Text style={styles.btnText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.downloadBtn} onPress={downloadPDF} disabled={generating}>
          {generating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="download-outline" size={24} color="#fff" />
              <Text style={styles.btnText}>Download</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  receiptContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  receiptHeader: { backgroundColor: "#10b981", padding: 30, alignItems: "center" },
  successText: { color: "#fff", fontSize: 22, fontWeight: "700", marginTop: 8 },
  hostelName: { color: "#fff", fontSize: 18, fontWeight: "600", marginTop: 4 },
  systemName: { color: "#fff", fontSize: 14, opacity: 0.9 },

  receiptBody: { padding: 24 },
  receiptNumber: { textAlign: "center", fontSize: 15, color: "#666", marginBottom: 20 },

  amountBox: {
    backgroundColor: "#ecfdf5",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  amountLabel: { fontSize: 15, color: "#10b981", fontWeight: "600" },
  amountValue: { fontSize: 36, fontWeight: "700", color: "#10b981", marginTop: 6 },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: "#555", marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  label: { fontSize: 15, color: "#666" },
  value: { fontSize: 15, fontWeight: "600", color: "#111" },
  completed: { fontSize: 15, fontWeight: "700", color: "#10b981" },

  notes: { fontSize: 14, color: "#444", lineHeight: 20 },

  footer: { padding: 20, borderTopWidth: 1, borderTopColor: "#eee", alignItems: "center" },
  footerText: { fontSize: 12, color: "#888", textAlign: "center" },
  footerTextSmall: { fontSize: 11, color: "#aaa", marginTop: 6 },

  bottomBar: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  shareBtn: {
    flex: 1,
    backgroundColor: "#58A895",
    height: 56,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  downloadBtn: {
    flex: 1,
    backgroundColor: "#10b981",
    height: 56,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "600" },

  errorText: { flex: 1, textAlign: "center", fontSize: 18, color: "#666" },
});