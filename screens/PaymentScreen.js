import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";

const paymentMethods = [
  {
    id: "bancontact",
    name: "Bancontact",
    logo: require("../assets/bancontact.png"), // Voeg eigen logo toe in assets
  },
  {
    id: "mastercard",
    name: "MasterCard",
    logo: require("../assets/mastercard.png"),
  },
  {
    id: "payconiq",
    name: "Payconiq",
    logo: require("../assets/payconiq.png"),
  },
];

const PaymentScreen = ({ route, navigation }) => {
  const { ticket } = route.params || {};

  if (!ticket) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Geen ticketgegevens gevonden.</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Ga terug</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const price =
    typeof ticket.price === "number"
      ? ticket.price
      : parseFloat(ticket.price) || 0;

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isPaying, setIsPaying] = useState(false);

  const handlePayment = () => {
    if (!selectedMethod) {
      Alert.alert(
        "Kies een betaalmethode",
        "Selecteer eerst een betaalmethode."
      );
      return;
    }
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      Alert.alert("Succes", "Betaling voltooid!");
      navigation.navigate("Main", { screen: "Tickets" });
    }, 2000);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Betaling voor je ticket</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Parking:</Text>
        <Text style={styles.value}>
          {ticket.parkingName || ticket.type || "Onbekend"}
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Duur:</Text>
        <Text style={styles.value}>{ticket.duration || 0} minuten</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Prijs:</Text>
        <Text style={styles.priceValue}>€{price.toFixed(2)}</Text>
      </View>

      <Text style={styles.selectTitle}>Kies je betaalmethode</Text>

      <View style={styles.methodsContainer}>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodButton,
              selectedMethod === method.id && styles.methodButtonSelected,
            ]}
            onPress={() => setSelectedMethod(method.id)}
            activeOpacity={0.8}
          >
            <Image
              source={method.logo}
              style={styles.methodLogo}
              resizeMode="contain"
            />
            <Text
              style={[
                styles.methodText,
                selectedMethod === method.id && styles.methodTextSelected,
              ]}
            >
              {method.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.payButton, isPaying && styles.disabledButton]}
        onPress={handlePayment}
        disabled={isPaying}
      >
        <Text style={styles.payButtonText}>
          {isPaying ? "Betalen..." : "Betalen"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#f9faff",
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#001D3D",
    textAlign: "center",
  },
  infoBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  label: {
    fontSize: 18,
    color: "#555",
    fontWeight: "600",
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B263B",
  },
  priceValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#EB6534",
  },
  selectTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginVertical: 20,
    color: "#001D3D",
    alignSelf: "center",
  },
  methodsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  methodButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    width: 110,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  methodButtonSelected: {
    borderColor: "#EB6534",
    backgroundColor: "#FFF4E6",
  },
  methodLogo: {
    width: 50,
    height: 30,
    marginBottom: 10,
  },
  methodText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  methodTextSelected: {
    color: "#EB6534",
  },
  payButton: {
    backgroundColor: "#001D3D",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: "#999",
  },
  payButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#001D3D",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  backButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default PaymentScreen;
