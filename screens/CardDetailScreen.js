import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function CardDetailScreen() {
  const [cardData, setCardData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardholderName: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        console.log("📦 Token geladen:", token);

        if (!token) {
          Alert.alert("Fout", "Token niet gevonden, log opnieuw in.");
          return;
        }

        const res = await axios.get(
          "https://raedar-backend.onrender.com/api/users",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const card = res.data.card || {};
        setCardData({
          cardNumber: card.number || "",
          expiry: card.expiry || "",
          cvv: card.cvv || "",
          cardholderName: card.holder || "",
        });
      } catch (error) {
        console.error(
          "❌ Fout bij laden:",
          error.response?.data || error.message
        );
        Alert.alert(
          "Fout",
          error.response?.data?.error || "Kon kaartgegevens niet laden."
        );
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    const { cardNumber, expiry, cvv, cardholderName } = cardData;

    if (!/^\d{16}$/.test(cardNumber)) {
      return Alert.alert(
        "Ongeldig",
        "Voer een geldig kaartnummer in (16 cijfers)."
      );
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      return Alert.alert(
        "Ongeldig",
        "Voer een geldige vervaldatum in (MM/YY)."
      );
    }

    if (!/^\d{3}$/.test(cvv)) {
      return Alert.alert("Ongeldig", "Voer een geldige CVV in (3 cijfers).");
    }

    if (!/^[A-Z\s]+$/i.test(cardholderName.trim())) {
      return Alert.alert(
        "Ongeldig",
        "Naam mag alleen letters en spaties bevatten."
      );
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      console.log("🔐 Opslaan met token:", token);

      if (!token) {
        Alert.alert("Fout", "Geen geldige token. Log opnieuw in.");
        return;
      }

      await axios.post(
        "https://raedar-backend.onrender.com/api/users/update",
        {
          card: {
            number: cardNumber,
            expiry,
            cvv,
            holder: cardholderName,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert("Success", "Kaartgegevens opgeslagen!");
    } catch (error) {
      console.error(
        "❌ Fout bij opslaan:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Fout",
        error.response?.data?.error || "Kon kaartgegevens niet opslaan."
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Payment method</Text>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Credit Card</Text>
            <Image
              source={require("../assets/mastercard.png")}
              style={styles.mastercardLogo}
            />
            <View style={styles.chip} />
          </View>

          <Text style={styles.sectionTitle}>Card Detail</Text>

          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Card Number"
              value={cardData.cardNumber}
              onChangeText={(text) =>
                setCardData({
                  ...cardData,
                  cardNumber: text.replace(/[^0-9]/g, "").slice(0, 16),
                })
              }
              keyboardType="numeric"
              placeholderTextColor="#A0A9C0"
            />
            <Image
              source={require("../assets/mastercard.png")}
              style={styles.smallMastercard}
            />
          </View>

          <View style={[styles.inputRow, { justifyContent: "space-between" }]}>
            <TextInput
              style={[styles.input, { flex: 0.45 }]}
              placeholder="MM/YY"
              value={cardData.expiry}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9]/g, "");
                let formatted = cleaned;
                if (cleaned.length >= 3) {
                  formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
                }
                setCardData({ ...cardData, expiry: formatted.slice(0, 5) });
              }}
              keyboardType="numbers-and-punctuation"
              placeholderTextColor="#A0A9C0"
            />
            <TextInput
              style={[styles.input, { flex: 0.45 }]}
              placeholder="CVV"
              value={cardData.cvv}
              onChangeText={(text) =>
                setCardData({
                  ...cardData,
                  cvv: text.replace(/[^0-9]/g, "").slice(0, 3),
                })
              }
              keyboardType="numeric"
              placeholderTextColor="#A0A9C0"
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Cardholder Name"
            value={cardData.cardholderName}
            onChangeText={(text) =>
              setCardData({
                ...cardData,
                cardholderName: text.replace(/[^a-zA-Z\s]/g, ""),
              })
            }
            placeholderTextColor="#A0A9C0"
            autoCapitalize="characters"
          />

          <TouchableOpacity
            style={styles.confirmButton}
            activeOpacity={0.8}
            onPress={handleSave}
          >
            <Text style={styles.confirmButtonText}>Confirm Payment</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9F9F9",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#001D3D",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#0A1F44",
    borderRadius: 24,
    height: 200,
    padding: 20,
    marginBottom: 32,
    justifyContent: "space-between",
  },
  cardLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  mastercardLogo: {
    width: 56,
    height: 44,
    alignSelf: "flex-end",
    top: 80,
  },
  chip: {
    width: 50,
    height: 35,
    backgroundColor: "#D4AF37",
    borderRadius: 6,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#001D3D",
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "center",
  },
  input: {
    backgroundColor: "#E6E8F0",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: "600",
    color: "#3D4C63",
    marginRight: 12,
  },
  smallMastercard: {
    width: 36,
    height: 24,
    resizeMode: "contain",
  },
  confirmButton: {
    backgroundColor: "#0A1F44",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 40,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
