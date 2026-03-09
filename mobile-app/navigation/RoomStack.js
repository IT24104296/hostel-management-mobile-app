import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import RoomListScreen from "../screens/RoomListScreen";
import EditRoomScreen from "../screens/EditRoomScreen";

const Stack = createNativeStackNavigator();

export default function RoomStack({navigation}) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="RoomList"
        component={RoomListScreen}
        options={{ title: "Room & Occupancy" }}
      />

      <Stack.Screen
        name="EditRoom"
        component={EditRoomScreen}
        options={{ title: "Edit Room" }}
      />
    </Stack.Navigator>
  );
}