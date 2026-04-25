/*import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});*/

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ContractListScreen from "./screens/Contracts/ContractListScreen";
import AddContractScreen from "./screens/Contracts/AddContractScreen";
import ExpiringContractsScreen from "./screens/Contracts/ExpiringContractsScreen";
import ContractHistoryScreen from "./screens/Contracts/ContractHistoryScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>

        <Stack.Screen name="Contracts" component={ContractListScreen} />
        <Stack.Screen name="AddContract" component={AddContractScreen} />
        <Stack.Screen name="ExpiringContracts" component={ExpiringContractsScreen} />
        <Stack.Screen name="ContractHistory" component={ContractHistoryScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
