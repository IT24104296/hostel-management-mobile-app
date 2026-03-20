import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HomeScreen from "../screens/Home/HomeScreen";
import StudentListScreen from "../screens/students/StudentListScreen";
import RoomPlaceholder from "../screens/Home/RoomPlaceholder";
import PaymentPlaceholder from "../screens/Home/PaymentPlaceholder";



const Tab = createBottomTabNavigator();

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
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Students" component={StudentListScreen} />
      <Tab.Screen name="Rooms" component={RoomPlaceholder} />
      <Tab.Screen name="Payments" component={PaymentPlaceholder} />
     
      
      
    </Tab.Navigator>
  );
}