//====================================================================
/*import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from "react-native";

export default function ContractListScreen({ navigation }) {

const [search,setSearch] = useState("");

const contracts = [
{
id:"1",
name:"Sanduni Kawya",
room:"Room 11",
studentId:"HS2024001",
status:"Active",
date:"Jan 10, 2026 - Jan 10, 2027"
},
{
id:"2",
name:"Dilki Sanjana",
room:"Room 13",
studentId:"HS2024002",
status:"Expire",
date:"Jan 10, 2026 - Mar 08, 2026"
}
];

const filteredContracts = contracts.filter(item =>
item.studentId.toLowerCase().includes(search.toLowerCase())
);

return(

<View style={styles.container}>

<Text style={styles.title}>CONTRACT LIST</Text>

<TextInput
placeholder="Search for student..."
style={styles.search}
value={search}
onChangeText={setSearch}
/>

<View style={styles.filterRow}>

<TouchableOpacity style={styles.filterActive}>
<Text>All</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.filter}
onPress={()=>navigation.navigate("Expiring Contracts")}
>
<Text>Expiring soon</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.filter}
onPress={()=>navigation.navigate("Contract History")}
>
<Text>Expired</Text>
</TouchableOpacity>

</View>

<FlatList
data={filteredContracts}
keyExtractor={(item)=>item.id}
renderItem={({item})=>(
<View style={styles.card}>
<Text style={styles.name}>{item.name}</Text>
<Text>{item.room}  •  {item.studentId}</Text>
<Text>{item.date}</Text>
<Text style={item.status==="Active"?styles.active:styles.expire}>
{item.status}
</Text>
</View>
)}
/>

<TouchableOpacity
style={styles.addButton}
onPress={()=>navigation.navigate("Add Contract")}
>
<Text style={{fontSize:28,color:"white"}}>+</Text>
</TouchableOpacity>

</View>

);
}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#cfe3df",
padding:20
},

title:{
fontSize:24,
fontWeight:"bold",
marginBottom:15
},

search:{
backgroundColor:"white",
padding:10,
borderRadius:10,
marginBottom:10
},

filterRow:{
flexDirection:"row",
marginBottom:10
},

filter:{
backgroundColor:"#ddd",
padding:10,
borderRadius:10,
marginRight:10
},

filterActive:{
backgroundColor:"#7dc2b5",
padding:10,
borderRadius:10,
marginRight:10
},

card:{
backgroundColor:"white",
padding:15,
borderRadius:12,
marginBottom:10
},

name:{
fontWeight:"bold",
fontSize:16
},

active:{
color:"green"
},

expire:{
color:"orange"
},

addButton:{
position:"absolute",
bottom:30,
right:30,
backgroundColor:"#3d8c7c",
width:60,
height:60,
borderRadius:30,
justifyContent:"center",
alignItems:"center"
}

}); */
//==========================================================================

/*
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import axios from "axios";

export default function ContractListScreen({ navigation }) {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContracts = async () => {
    try {
      setLoarding(true);  
      const res = await axios.get("http://192.168.0.3:5000/api/contracts");
      console.log("DATA:", res.data); //degug
      setContracts(res.data);
      setLoading(false);
      
    } catch (err) {
      console.log("ERROR:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  // LOADING UI
  // =========================
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Loading contracts...</Text>
      </View>
    );
  } */
  /*
//================================================================================
  const renderItem = ({ item }) => {
    const today = new Date();
    const end = new Date(item.endDate);

    let status = "Active";
    let color = "green";

    if (end < today) {
      status = "Expired";
      color = "red";
    }

    return (
      <View style={styles.card}>
        <Text style={styles.name}>{item.studentName}</Text>
        <Text>Room {item.roomNumber}</Text>
        <Text>
          {new Date(item.moveInDate).toDateString()} →{" "}
          {new Date(item.endDate).toDateString()}
        </Text>
        <Text style={{ color }}>{status}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CONTRACT LIST</Text>

      <FlatList
        data={contracts}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
      />

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate("AddContract")}
      >
        <Text style={{ color: "#fff", fontSize: 20 }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#CFE3DF" },
  title: { fontSize: 20, marginBottom: 10 },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10
  },

  name: { fontWeight: "bold" },

  addBtn: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#3FA58D",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center"
  }
});*/
//=========================================================================
/*
// RENDER EACH ITEM
  // =========================
  const renderItem = ({ item }) => {

    const today = new Date();
    const end = new Date(item.endDate);

    let status = "Active";
    let color = "green";

    if (end < today) {
      status = "Expired";
      color = "red";
    }

    return (
      <View style={styles.card}>
        <Text style={styles.name}>{item.studentName}</Text>

        <Text style={styles.subText}>
          Room {item.roomNumber} • {item.studentId}
        </Text>

        <Text style={styles.date}>
          {new Date(item.moveInDate).toDateString()} →{" "}
          {new Date(item.endDate).toDateString()}
        </Text>

        <Text style={{ color, fontWeight: "bold" }}>
          {status}
        </Text>
      </View>
    );
  };

  // =========================
  // MAIN UI
  // =========================
  return (
    <View style={styles.container}>

      <Text style={styles.title}>CONTRACT LIST</Text>

      <FlatList
        data={contracts}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
      />

    </View>
  );
}


// =========================
// STYLES
// =========================
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#dcefe9",
    padding: 15
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2
  },

  name: {
    fontSize: 16,
    fontWeight: "bold"
  },

  subText: {
    color: "gray",
    marginTop: 4
  },

  date: {
    marginTop: 5
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }

});*/





//new
/*
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons";

export default function ContractListScreen({ navigation }) {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // HARDCODED DATA 
  const hardcodedContracts = [
    
    {
      id: "2",
      name: "Dilki Sanjana",
      room: "Room 13",
      studentId: "HS2024002",
      startDate: "Jan 10, 2026",
      endDate: "Mar 08, 2026",
      status: "Expired",
    },
  ];

  // ✅ FETCH FROM BACKEND
  const fetchContracts = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://192.168.0.3:5000/api/contracts"
      );

      // format backend data to match UI
      const apiData = res.data.map((item, index) => {
        const today = new Date();
        const end = new Date(item.endDate);

        let status = "Active";
        if (end < today) status = "Expired";

        return {
          id: item._id || index.toString(),
          name: item.studentName,
          room: `Room ${item.roomNumber}`,
          studentId: item.studentId,
          startDate: new Date(item.moveInDate).toDateString(),
          endDate: new Date(item.endDate).toDateString(),
          status: status,
        };
      });

      // ✅ NEW DATA ON TOP 
      setContracts([...apiData, ...hardcodedContracts]);

      setLoading(false);
    } catch (err) {
      console.log("ERROR:", err);
      setContracts(hardcodedContracts); // fallback
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchContracts);
    return unsubscribe;
  }, [navigation]);

  // ✅ SEARCH FILTER (by student ID)
  const filteredContracts = contracts.filter((item) =>
    item.studentId.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const color = item.status === "Active" ? "green" : "orange";

    return (
      <View style={styles.card}>
        <Text style={styles.name}>{item.name}</Text>
        <Text>
          {item.room}  •  {item.studentId}
        </Text>
        <Text>
          {item.startDate} - {item.endDate}
        </Text>
        <Text style={{ color }}>{item.status}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CONTRACT LIST</Text>

      // ✅ SEARCH BAR 
      <TextInput
        style={styles.search}
        placeholder="Search for student..."
        value={search}
        onChangeText={setSearch}
      />

      // ✅ FILTER BUTTONS 
      <View style={styles.filters}>
        <TouchableOpacity style={styles.activeBtn}>
          <Text>All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate("ExpiringContracts")}
        >
          <Text>Expiring soon</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate("ContractHistory")}
        >
          <Text>Expired</Text>
        </TouchableOpacity>
      </View>

      // ✅ LOADING 
      {loading ? (
        <ActivityIndicator size="large" color="green" />
      ) : (
        <FlatList
          data={filteredContracts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}

      // ✅ FLOATING BUTTON 
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddContract")}
      >
        <Text style={{ color: "#fff", fontSize: 30 }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c9dcdc",
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  search: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  filters: {
    flexDirection: "row",
    marginBottom: 10,
  },
  btn: {
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  activeBtn: {
    backgroundColor: "#8fd3c1",
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: "#2e8b75",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
}); */


import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons";

export default function ContractListScreen({ navigation }) {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false); 

  // ✅ DELETE CONTRACT
  const deleteContract = async (item) => {
    try {
      await axios.delete(
        `http://192.168.8.101:5000/api/contracts/${item.id}`
      );

      setContracts((prev) =>
        prev.filter((c) => c.id !== item.id)
      );
    } catch (err) {
      Alert.alert("Error deleting contract");
    }
  };

  // ✅ FETCH FROM BACKEND
  const fetchContracts = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://192.168.8.101:5000/api/contracts"
      );

      const apiData = res.data.map((item, index) => {
        const today = new Date();
        const end = new Date(item.endDate);

        let status = "Active";
        if (end < today) status = "Expired";

        return {
          id: item._id || index.toString(),
          name: item.studentName,
          room: `Room ${item.roomNumber}`,
          studentId: item.studentId,
          startDate: new Date(item.moveInDate).toDateString(),
          endDate: new Date(item.endDate).toDateString(),
          status,
          contactNumber: item.contactNumber,
        };
      });

      setContracts(apiData);
      setLoading(false);
    } catch (err) {
      console.log("ERROR:", err);
      setContracts([]);
      setLoading(false);
    }
  };

  // pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchContracts();
    setRefreshing(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchContracts);
    return unsubscribe;
  }, [navigation]);

  // ✅ SEARCH (by student ID)
  const filteredContracts = contracts.filter((item) =>
    item.studentId.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const color = item.status === "Active" ? "green" : "orange";

    return (
      <View style={styles.card}>
        {/* 🗑 DELETE ICON */}
        <TouchableOpacity
          style={styles.deleteIcon}
          onPress={() => deleteContract(item)}
        >
          <MaterialIcons name="delete" size={20} color="red" />
        </TouchableOpacity>

        <Text style={styles.name}>{item.name}</Text>

        <Text>
          {item.room}  •  {item.studentId}
        </Text>

        {/* ✅ CONTACT NUMBER */}
        <Text>{item.contactNumber}</Text>

        <Text>
          {item.startDate} - {item.endDate}
        </Text>

        <Text style={{ color }}>{item.status}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CONTRACT LIST</Text>

      {/* SEARCH */}
      <TextInput
        style={styles.search}
        placeholder="Search for student..."
        value={search}
        onChangeText={setSearch}
      />

      {/* FILTER BUTTONS */}
      <View style={styles.filters}>
        <TouchableOpacity style={styles.activeBtn}>
          <Text>All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate("ExpiringContracts")}
        >
          <Text>Expiring soon</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate("ContractHistory")}
        >
          <Text>Expired</Text>
        </TouchableOpacity>
      </View>

      {/* LOADING */}
      {loading ? (
        <ActivityIndicator size="large" color="green" />
      ) : (
        <FlatList
          data={filteredContracts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}

      {/* FLOATING BUTTON */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddContract")}
      >
        <Text style={{ color: "#fff", fontSize: 30 }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c9dcdc",
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  search: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  filters: {
    flexDirection: "row",
    marginBottom: 10,
  },
  btn: {
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  activeBtn: {
    backgroundColor: "#8fd3c1",
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    position: "relative",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  deleteIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  fab: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: "#2e8b75",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});