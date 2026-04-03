import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PaymentListScreen from "../screens/PaymentListScreen";
import PaymentDetailsScreen from "../screens/PaymentDetailsScreen";
import NewPaymentScreen from "../screens/NewPaymentScreen";
import ReceiptScreen from "../screens/ReceiptScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="PaymentList"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="PaymentList" component={PaymentListScreen} />
        <Stack.Screen name="PaymentDetails" component={PaymentDetailsScreen} />
        <Stack.Screen name="NewPayment" component={NewPaymentScreen} />
        <Stack.Screen name="Receipt" component={ReceiptScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}