import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AccountScreen = () => {
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const userToken = await AsyncStorage.getItem("userToken");
      if (!userToken) return;

      try {
        const response = await fetch(
          "https://raedar-backend.onrender.com/api/users",
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        const data = await response.json();

        setUserEmail(data.email || "");
        setUserName(data.name || "");
        setCreatedAt(data.createdAt || "");
      } catch (err) {
        console.log("Fout bij ophalen van gebruikersgegevens:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#001D3D" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.avatarContainer}>
        <Image
          source={{
            uri: "https://ui-avatars.com/api/?name=" + userName,
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{userName}</Text>
        <Text style={styles.email}>{userEmail}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Naam</Text>
        <Text style={styles.value}>{userName}</Text>

        <Text style={styles.label}>E-mail</Text>
        <Text style={styles.value}>{userEmail}</Text>

        <Text style={styles.label}>Account aangemaakt op</Text>
        <Text style={styles.value}>
          {new Date(createdAt).toLocaleDateString("nl-NL")}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    backgroundColor: "#F5F7FA",
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: "600",
    color: "#001D3D",
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: "#888",
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: "#001D3D",
    fontWeight: "500",
  },
});

export default AccountScreen;
