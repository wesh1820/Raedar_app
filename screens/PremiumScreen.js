import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

const PremiumScreen = () => {
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [pendingCancellation, setPendingCancellation] = useState(false);
  const [token, setToken] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Haal user data op en check premium verloop
  const fetchUserData = async () => {
    setLoading(true);
    const userToken = await AsyncStorage.getItem("userToken");
    if (!userToken) {
      setIsPremium(false);
      setPendingCancellation(false);
      setToken(null);
      setLoading(false);
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
        const now = new Date();
        const expireDate = data.premiumEndDate
          ? new Date(data.premiumEndDate)
          : null;

        console.log("User data:", data);
        console.log("Now:", now);
        console.log("Expire date:", expireDate);
        console.log("Premium flag:", data.premium);

        // Check of premium geldig is en nog niet verlopen
        if (data.premium && expireDate && expireDate > now) {
          setIsPremium(true);
        } else {
          setIsPremium(false);
        }

        setPendingCancellation(data.premiumCancelPending || false);
      }
    } catch (err) {
      console.log("Error fetching user info:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Functie om premium te kopen (maand/jaar)
  const purchasePremium = async (type) => {
    // type: 'month' of 'year'
    setShowModal(false);
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
          body: JSON.stringify({ premiumType: type }), // backend verwacht 'premiumType'
        }
      );
      const data = await response.json();
      setLoading(false);
      if (data.success) {
        Alert.alert(
          "Succes",
          `Premium geactiveerd (${type === "month" ? "maand" : "jaar"})!`
        );
        // Na succes vernieuw data om juiste expireDate te krijgen
        fetchUserData();
      } else {
        Alert.alert("Fout", data.error || "Kon premium niet activeren.");
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Fout", "Er is een probleem met de server.");
    }
  };

  // Premium annuleren
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
                fetchUserData(); // update status
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
          onPress={() => setShowModal(true)}
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

      {/* Modal voor keuze maand of jaar */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kies een abonnement</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => purchasePremium("month")}
            >
              <Text style={styles.modalButtonText}>€4,99 per maand</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => purchasePremium("year")}
            >
              <Text style={styles.modalButtonText}>€48,99 per jaar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={[styles.modalButton, styles.modalCancelButton]}
            >
              <Text style={[styles.modalButtonText, { color: "#EB6534" }]}>
                Annuleer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    textShadowColor: "#001D3D",
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
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 1,
  },
  pendingContainer: {
    marginTop: 10,
    backgroundColor: "#fce5e3",
    padding: 16,
    borderRadius: 14,
    marginHorizontal: 20,
  },
  pendingText: {
    color: "#d9534f",
    fontWeight: "700",
    fontSize: 17,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    width: "100%",
    maxWidth: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 25,
    textAlign: "center",
    color: "#001D3D",
  },
  modalButton: {
    backgroundColor: "#001D3D",
    borderRadius: 25,
    paddingVertical: 15,
    marginVertical: 8,
    alignItems: "center",
  },
  modalCancelButton: {
    backgroundColor: "#f4f4f4",
    borderWidth: 1,
    borderColor: "#EB6534",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 17,
  },
});
