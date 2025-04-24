// screens/MoreScreen.js

import React, { useState } from "react";
import { View, Text, Switch, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MoreScreen = ({ setIsLoggedIn }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    setIsLoggedIn(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Account</Text>
      <TouchableOpacity style={styles.row}>
        <Text style={styles.label}>Profile</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Preferences</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Enable Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />
      </View>

      <Text style={styles.sectionTitle}>App</Text>
      <TouchableOpacity style={styles.row} onPress={handleLogout}>
        <Text style={[styles.label, { color: "red" }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 50,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  label: {
    fontSize: 16,
    color: "#444",
  },
});

export default MoreScreen;
