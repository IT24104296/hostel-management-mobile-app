import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfilePlaceholder({ navigation }) {
  const logout = async () => {
    await AsyncStorage.removeItem("token");
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
      <Text>Profile / Settings</Text>
      <TouchableOpacity onPress={logout} style={{ padding: 12, backgroundColor: "#111", borderRadius: 10 }}>
        <Text style={{ color: "#fff" }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}