// CardDetailScreen.js

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export default function CardDetailScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
        accessibilityLabel="Ga terug"
      >
        <Icon name="arrow-back" size={28} color="#001D3D" />
      </TouchableOpacity> */}

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
          defaultValue="3134134893949"
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
          defaultValue="10/28"
          keyboardType="numeric"
          placeholderTextColor="#A0A9C0"
        />
        <TextInput
          style={[styles.input, { flex: 0.45 }]}
          placeholder="CVV"
          defaultValue="820"
          keyboardType="numeric"
          placeholderTextColor="#A0A9C0"
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Cardholder Name"
        defaultValue="JOHN SMITH"
        placeholderTextColor="#A0A9C0"
        autoCapitalize="characters"
      />

      <TouchableOpacity style={styles.confirmButton} activeOpacity={0.8}>
        <Text style={styles.confirmButtonText}>Confirm Payment</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  backButton: { marginBottom: 20 },
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
  totalContainer: {
    backgroundColor: "#E6E8F0",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    marginBottom: 40,
  },
  totalLabel: {
    fontWeight: "700",
    fontSize: 14,
    color: "#637381",
  },
  totalAmount: {
    fontWeight: "700",
    fontSize: 18,
    color: "#001D3D",
  },
  confirmButton: {
    backgroundColor: "#0A1F44",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    top: 40,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
