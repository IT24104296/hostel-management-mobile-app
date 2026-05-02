// ═══════════════════════════════════════════════════════════════════
//  mobile-app/App.js  —  UPDATED
//
//  CHANGES FROM PREVIOUS VERSION:
//  Added imports and Stack.Screen entries for the two new screens:
//    • ExpenseList  → name="Expenses"
//    • ExpenseForm  → name="ExpenseForm"
//
//  All existing screens are unchanged.
// ═══════════════════════════════════════════════════════════════════

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Existing screens
import FinancialScreen from "./screens/reports/financial";
import ReportScreen    from "./screens/reports/report";
import ReportList      from "./screens/reports/ReportList";

// ✅ NEW: Expense screens
import ExpenseList from "./screens/reports/ExpenseList";
import ExpenseForm from "./screens/reports/ExpenseForm";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>

        {/* Existing screens — unchanged */}
        <Stack.Screen
          name="Financial"
          component={FinancialScreen}
          options={{ title: "Financial Summary" }}
        />

        <Stack.Screen
          name="Report"
          component={ReportScreen}
          options={{ title: "Detailed Report" }}
        />

        <Stack.Screen
          name="Reports"
          component={ReportList}
          options={{ title: "Saved Reports" }}
        />

        {/* ✅ NEW: Expense screens */}
        <Stack.Screen
          name="Expenses"
          component={ExpenseList}
          options={{ title: "Expenses" }}
        />

        <Stack.Screen
          name="ExpenseForm"
          component={ExpenseForm}
          // Title changes dynamically based on Add vs Edit mode
          options={({ route }) =>
            ({ title: route.params?.expense ? "Edit Expense" : "Add Expense" })
          }
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
