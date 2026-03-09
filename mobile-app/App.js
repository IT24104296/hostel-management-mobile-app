import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import RoomStack from "./navigation/RoomStack";
import { View, Text } from "react-native";

const Tab = createBottomTabNavigator();

function HomePlaceholder() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Home Screen (common)</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Home" component={HomePlaceholder} />
        <Tab.Screen name="Rooms" component={RoomStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}