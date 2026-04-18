import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";

import StudentListScreen from "../screens/students/StudentListScreen";
import AddStudentScreen from "../screens/students/AddStudentScreen";
import StudentProfileScreen from "../screens/students/StudentProfileScreen";
import EditStudentScreen from "../screens/students/EditStudentScreen";
import ContractPlaceholder from "../screens/Home/ContractPlaceholder";
import ReportsPlaceholder from "../screens/Home/ReportsPlaceholder";
import NotificationsPlaceholder from "../screens/Home/NotificationsPlaceholder";
import PaymentPlaceholder from "../screens/Home/PaymentPlaceholder";
import ProfilePlaceholder from "../screens/Home/ProfilePlaceholder";

import LoginScreen from "../screens/UserAuth/LoginScreen";
import SignupScreen from "../screens/UserAuth/SignupScreen";
import AppTabs from "./AppTabs";

const Stack = createNativeStackNavigator();



export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("token");
      setInitialRoute(token ? "AppTabs" : "Login");
    })();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>

        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="StudentList" component={StudentListScreen} />
        <Stack.Screen name="AddStudent" component={AddStudentScreen} />
        <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
        <Stack.Screen name="EditStudent" component={EditStudentScreen} />
        <Stack.Screen name="Payments" component={PaymentPlaceholder} />
        <Stack.Screen name="Notifications" component={NotificationsPlaceholder} />
        <Stack.Screen name="Reports" component={ReportsPlaceholder} />
        <Stack.Screen name="Contracts" component={ContractPlaceholder} />
         <Stack.Screen name="AppTabs" component={AppTabs} />
         <Stack.Screen name="Profile" component={ProfilePlaceholder} />
      </Stack.Navigator>
    
  );
}