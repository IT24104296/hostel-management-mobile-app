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


import ProfilePlaceholder from "../screens/Home/ProfilePlaceholder";

import LoginScreen from "../screens/UserAuth/LoginScreen";
import SignupScreen from "../screens/UserAuth/SignupScreen";
import AppTabs from "./AppTabs";
import RoomListScreen from "../screens/room/RoomListScreen";
import EditRoomScreen from "../screens/room/EditRoomScreen";
import PaymentDashboardScreen from "../screens/payment/PaymentDashboardScreen";
import StudentPaymentDetailScreen from "../screens/payment/StudentPaymentDetailScreen";

import ContractListScreen from "../screens/Contracts/ContractListScreen";
import AddContractScreen from "../screens/Contracts/AddContractScreen";
import ExpiringContractsScreen from "../screens/Contracts/ExpiringContractsScreen";
import ContractHistoryScreen from "../screens/Contracts/ContractHistoryScreen";
import PaymentReceiptScreen from "../screens/payment/PaymentReceiptScreen";
import NotificationScreen from "../screens/notifications/NotificationScreen";

import FinancialScreen from "../screens/reports/financial";
import ReportScreen    from "../screens/reports/report";
import ReportList      from "../screens/reports/ReportList";
import ExpenseList from "../screens/reports/ExpenseList";
import ExpenseForm from "../screens/reports/ExpenseForm";

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
       
        
        <Stack.Screen name="AppTabs" component={AppTabs} />
         <Stack.Screen name="Profile" component={ProfilePlaceholder} />
          <Stack.Screen name="RoomList" component={RoomListScreen} />
          <Stack.Screen name="EditRoom" component={EditRoomScreen} />
          <Stack.Screen name="PaymentDashboard" component={PaymentDashboardScreen} />
          <Stack.Screen name="StudentPaymentDetail" component={StudentPaymentDetailScreen} />
          <Stack.Screen name="Contracts" component={ContractListScreen} />
        <Stack.Screen name="AddContract" component={AddContractScreen} />
        <Stack.Screen name="ExpiringContracts" component={ExpiringContractsScreen} />
        <Stack.Screen name="ContractHistory" component={ContractHistoryScreen} />
        <Stack.Screen name="PaymentReceipt" component={PaymentReceiptScreen} />
        <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
        <Stack.Screen name="Financial" component={FinancialScreen}/>
        <Stack.Screen name="Report" component={ReportScreen} options={{ title: "Detailed Report" }} />

        <Stack.Screen name="Reports" component={ReportList}/>
          <Stack.Screen name="Expenses" component={ExpenseList}/>
        <Stack.Screen  name="ExpenseForm"  component={ExpenseForm}
        options={({ route }) =>
            ({ title: route.params?.expense ? "Edit Expense" : "Add Expense" })
          }
        />

        
        
          
          
         
        

        
         
         
         
          
          
      </Stack.Navigator>
    
  );
}