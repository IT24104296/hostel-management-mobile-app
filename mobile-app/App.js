import React from "react";
<<<<<<< HEAD
import AppNavigator from "./navigation/AppNavigator";

export default function App() {
  return <AppNavigator />;
=======
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
>>>>>>> origin/develop
}