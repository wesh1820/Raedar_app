import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

const PremiumScreen = () => {
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [pendingCancellation, setPendingCancellation] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userToken = await AsyncStorage.getItem("userToken");
      if (!userToken) {
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.title}>✨ Premium Account ✨</Text>

      <Text style={styles.description}>
        Met een premium account krijg je toegang tot:
      </Text>
      <View style={styles.benefits}>
        <Text style={styles.benefit}>• Geen advertenties 🚫</Text>
        <Text style={styles.benefit}>
          • Toegang tot exclusieve features ⭐️
        </Text>
        <Text style={styles.benefit}>• Snellere ondersteuning ⚡️</Text>
        <Text style={styles.benefit}>• En nog veel meer...</Text>
      </View>

      {loading && (
        <ActivityIndicator
          size="large"
          color="#6a1b9a"
          style={{ marginVertical: 20 }}
        />
      )}

      {!loading && !isPremium && (
        <TouchableOpacity
          style={styles.button}
          onPress={handleBuyPremium}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Koop Premium</Text>
        </TouchableOpacity>
      )}

      {!loading && isPremium && !pendingCancellation && (
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancelPremium}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Zet Premium uit</Text>
        </TouchableOpacity>
      )}

      {!loading && isPremium && pendingCancellation && (
        <View style={styles.pendingContainer}>
          <Text style={styles.pendingText}>
            Premium opgezegd - loopt nog tot einde van de maand.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default PremiumScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f1f8",
    paddingHorizontal: 25,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 25,
    color: "#001D3D",
    textAlign: "center",
    textShadowColor: "#001D3D)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  description: {
    fontSize: 18,
    marginBottom: 20,
    color: "#4a4a4a",
    fontWeight: "600",
    textAlign: "center",
  },
  benefits: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#6a1b9a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  benefit: {
    fontSize: 17,
    marginVertical: 6,
    color: "#333",
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#001D3D",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#EB6534",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    marginHorizontal: 20,
  },
  cancelButton: {
    backgroundColor: "#EB6534",
    shadowColor: "#d9534f",
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 1,
  },
  pendingContainer: {
    marginHorizontal: 20,
    backgroundColor: "#EB6534",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#856404",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  pendingText: {
    fontSize: 18,
    color: "#856404",
    fontWeight: "700",
    textAlign: "center",
  },
});
