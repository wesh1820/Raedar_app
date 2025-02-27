import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TextInput,
  Button,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingsScreen = ({ navigation }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");

  // Toggle functions
  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleNotifications = () =>
    setIsNotificationsEnabled(!isNotificationsEnabled);

  // Logout functie
  const handleLogout = async () => {
    Alert.alert("Uitloggen", "Weet je zeker dat je wilt uitloggen?", [
      { text: "Annuleren", style: "cancel" },
      {
        text: "Uitloggen",
        onPress: async () => {
          await AsyncStorage.removeItem("userToken"); // Verwijder token

          // Reset navigation to AuthStack which contains the Login screen
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }], // Make sure "Login" is part of the AuthStack
          });
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Account Section */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setEmail(email ? "" : email)}
        >
          <Text style={styles.sectionTitle}>Account</Text>
        </TouchableOpacity>
        {email && (
          <View style={styles.sectionContent}>
            <Text style={styles.settingLabel}>Change Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter new email"
              value={email}
              onChangeText={setEmail}
            />
            <Button
              title="Save Email"
              onPress={() => console.log("Email saved:", email)}
            />
          </View>
        )}
      </View>

      {/* Visibility Section */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setIsVisible(!isVisible)}
        >
          <Text style={styles.sectionTitle}>Visibility</Text>
        </TouchableOpacity>
        {isVisible && (
          <View style={styles.sectionContent}>
            <Text style={styles.settingLabel}>Show my profile</Text>
            <Switch value={isVisible} onValueChange={toggleVisibility} />
          </View>
        )}
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setIsNotificationsEnabled(!isNotificationsEnabled)}
        >
          <Text style={styles.sectionTitle}>Notifications</Text>
        </TouchableOpacity>
        {isNotificationsEnabled && (
          <View style={styles.sectionContent}>
            <Text style={styles.settingLabel}>Enable Notifications</Text>
            <Switch
              value={isNotificationsEnabled}
              onValueChange={toggleNotifications}
            />
          </View>
        )}
      </View>

      {/* Payments Section */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setCardNumber(cardNumber ? "" : cardNumber)}
        >
          <Text style={styles.sectionTitle}>Payments</Text>
        </TouchableOpacity>
        {cardNumber && (
          <View style={styles.sectionContent}>
            <Text style={styles.settingLabel}>Add Payment Method</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Card Number"
              value={cardNumber}
              onChangeText={setCardNumber}
            />
            <Button
              title="Save Card"
              onPress={() => console.log("Card saved:", cardNumber)}
            />
          </View>
        )}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Uitloggen</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.5,
  },
  sectionHeader: {
    padding: 15,
    backgroundColor: "#001D3D",
    borderRadius: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  sectionContent: {
    padding: 10,
    backgroundColor: "#fafafa",
    borderRadius: 5,
    marginTop: 10,
  },
  settingLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    width: "80%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 10,
  },
  logoutButton: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#D9534F",
    borderRadius: 10,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default SettingsScreen;
