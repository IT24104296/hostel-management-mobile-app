/*
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ExpiringContractsScreen(){

return(

<View style={styles.container}>

<Text style={styles.title}>Expiring Contracts</Text>

<View style={styles.card}>
<Text>Nethmi Perera</Text>
<Text>Room 101</Text>
<Text style={styles.warn}>Expiring in 3 days</Text>
</View>

<View style={styles.card}>
<Text>Tharushi Bandara</Text>
<Text>Room 102</Text>
<Text style={styles.warn}>Expiring in 6 days</Text>
</View>

</View>

);

}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#cfe8e1",
padding:20
},

title:{
fontSize:22,
marginBottom:20
},

card:{
backgroundColor:"white",
padding:15,
borderRadius:10,
marginBottom:10
},

warn:{
color:"orange"
}

}); */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import axios from "axios";

export default function ExpiringContractsScreen() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContracts = async () => {
    try {
      const res = await axios.get(
        "http://192.168.8.101:5000/api/contracts"
      );

      const today = new Date();

      const expiring = res.data
        .map((item) => {
          const end = new Date(item.endDate);
          const diffDays = Math.ceil(
            (end - today) / (1000 * 60 * 60 * 24)
          );

          return {
            id: item._id,
            name: item.studentName,
            room: `Room ${item.roomNumber}`,
            daysLeft: diffDays,
          };
        })
        // ✅ only future (not expired)
        .filter((item) => item.daysLeft > 0)
        // ✅ sort nearest expiry first
        .sort((a, b) => a.daysLeft - b.daysLeft);

      setContracts(expiring);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text>{item.name}</Text>
      <Text>{item.room}</Text>
      <Text style={styles.warn}>
        Expiring in {item.daysLeft} days
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expiring Contracts</Text>

      {loading ? (
        <ActivityIndicator size="large" color="green" />
      ) : (
        <FlatList
          data={contracts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#cfe8e1",
    padding: 20,
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  warn: {
    color: "orange",
  },
});