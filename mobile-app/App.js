import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppTabs from "./navigation/AppTabs";

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppTabs />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}