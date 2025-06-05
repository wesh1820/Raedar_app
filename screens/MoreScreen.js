import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const MoreScreen = ({ setIsLoggedIn }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [pendingCancellation, setPendingCancellation] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      const userToken = await AsyncStorage.getItem("userToken");
      if (!userToken) {
        setIsLoggedIn(false);
        return;
      }
      setToken(userToken);

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
        if (data) {
          setIsPremium(data.premium || false);
          setPendingCancellation(data.premiumCancelPending || false);
        }
      } catch (err) {
        console.log("Error fetching user info:", err);
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    setIsLoggedIn(false);
  };

  const handleBuyPremium = async () => {
    if (isPremium) {
      Alert.alert("Je hebt al een premium account.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        "https://raedar-backend.onrender.com/api/users/premium",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setLoading(false);
      if (data.success) {
        Alert.alert("Premium geactiveerd!");
        setIsPremium(true);
        setPendingCancellation(false);
      } else {
        Alert.alert("Fout", data.error || "Kon premium niet activeren.");
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Fout", "Er is een probleem met de server.");
    }
  };

  const handleCancelPremium = async () => {
    Alert.alert(
      "Premium opzeggen",
      "Je blijft deze maand premium gebruiken, maar je abonnement wordt na deze maand stopgezet.",
      [
        { text: "Annuleer", style: "cancel" },
        {
          text: "Bevestig",
          onPress: async () => {
            setLoading(true);
            try {
              const response = await fetch(
                "https://raedar-backend.onrender.com/api/users/premium/cancel",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              const data = await response.json();
              setLoading(false);
              if (data.success) {
                Alert.alert("Premium geannuleerd.");
                setPendingCancellation(true);
              } else {
                Alert.alert(
                  "Fout",
                  data.error || "Kon premium niet annuleren."
                );
              }
            } catch (error) {
              setLoading(false);
              Alert.alert("Fout", "Er is een probleem met de server.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Meer</Text>

      <TouchableOpacity
        style={styles.row}
        onPress={() => navigation.navigate("Account")}
      >
        <Text style={styles.label}>Bekijk Accountgegevens</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Voorkeuren</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Notificaties aan</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />
      </View>

      <Text style={styles.sectionTitle}>Premium</Text>

      {loading && <ActivityIndicator size="small" color="#000" />}

      {!loading && !isPremium && (
        <TouchableOpacity style={styles.row} onPress={handleBuyPremium}>
          <Text style={styles.label}>Koop Premium</Text>
        </TouchableOpacity>
      )}

      {!loading && isPremium && !pendingCancellation && (
        <TouchableOpacity
          style={[styles.row, styles.premiumRow]}
          onPress={handleCancelPremium}
        >
          <Text style={[styles.label, styles.premiumLabel]}>
            Zet Premium uit
          </Text>
        </TouchableOpacity>
      )}

      {!loading && isPremium && pendingCancellation && (
        <View style={[styles.row, styles.pendingCancelRow]}>
          <Text style={[styles.label, styles.pendingCancelLabel]}>
            Premium opgezegd - loopt nog tot einde van de maand
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.row} onPress={handleLogout}>
        <Text style={[styles.label, { color: "red" }]}>Uitloggen</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MoreScreen;

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
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    color: "#444",
  },
  premiumRow: {
    backgroundColor: "#dff0d8",
  },
  premiumLabel: {
    color: "green",
    fontWeight: "bold",
  },
  pendingCancelRow: {
    backgroundColor: "#fff3cd",
  },
  pendingCancelLabel: {
    color: "#856404",
    fontWeight: "bold",
  },
});
