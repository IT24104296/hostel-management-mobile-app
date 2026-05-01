import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text } from "react-native";

import RoomStack from "./room/RoomStack";

const Tab = createBottomTabNavigator();

function HomePlaceholder() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Home Screen</Text>
    </View>
  );
}

function StudentPlaceholder() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Student Screen</Text>
    </View>
  );
}

function PaymentPlaceholder() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Payment Screen</Text>
    </View>
  );
}

export default function AppTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#2E8B7D",
        tabBarInactiveTintColor: "#111",
        tabBarStyle: {
          height: 58 + insets.bottom,
          paddingBottom: 10 + insets.bottom,
          paddingTop: 10,
          borderTopWidth: 0,
          elevation: 10,
          backgroundColor: "#fff",
        },
        tabBarIcon: ({ color, focused }) => {
          let icon = "home-outline";

          if (route.name === "Home") {
            icon = focused ? "home" : "home-outline";
          } else if (route.name === "Students") {
            icon = focused ? "people" : "people-outline";
          } else if (route.name === "Rooms") {
            icon = focused ? "business" : "business-outline";
          } else if (route.name === "Payments") {
            icon = focused ? "card" : "card-outline";
          }

          return <Ionicons name={icon} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomePlaceholder} />
      <Tab.Screen name="Students" component={StudentPlaceholder} />
      <Tab.Screen name="Rooms" component={RoomStack} />
      <Tab.Screen name="Payments" component={PaymentPlaceholder} />
    </Tab.Navigator>
  );
}