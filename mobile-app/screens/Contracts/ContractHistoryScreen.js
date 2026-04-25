/*
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ContractHistoryScreen(){

return(

<View style={styles.container}>

<Text style={styles.title}>Contract History</Text>

<View style={styles.card}>
<Text>Nathasha Perera</Text>
<Text>Room 101</Text>
<Text>7 Months</Text>
</View>

<View style={styles.card}>
<Text>Prabani Bandara</Text>
<Text>Room 102</Text>
<Text>7 Months</Text>
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

export default function ContractHistoryScreen() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContracts = async () => {
    try {
      const res = await axios.get(
        "http://192.168.8.101:5000/api/contracts"
      );

      const today = new Date();

      const expired = res.data
        .map((item) => {
          const end = new Date(item.endDate);

          return {
            id: item._id,
            name: item.studentName,
            room: `Room ${item.roomNumber}`,
            endDate: end.toDateString(),
          };
        })
        // ✅ only expired
        .filter((item) => new Date(item.endDate) < today);

      setContracts(expired);
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
      <Text>{item.endDate}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contract History</Text>

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
});