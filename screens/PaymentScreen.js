import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const paymentMethods = [
  {
    id: "belfius",
    name: "Belfius",
    image: require("../assets/belfius.png"),
  },
  {
    id: "kbc",
    name: "KBC",
    image: require("../assets/kbc.png"),
  },
  {
    id: "mastercard",
    name: "Mastercard",
    image: require("../assets/mastercard.png"),
  },
  {
    id: "bnp",
    name: "BNP Paribas Fortis",
    image: require("../assets/bnp.png"),
  },
  {
    id: "ing",
    name: "ING",
    image: require("../assets/ing.png"),
  },
  {
    id: "paypal",
    name: "PayPal",
    image: require("../assets/paypal.png"),
  },
  {
    id: "applepay",
    name: "Apple Pay",
    image: require("../assets/applepay.png"),
  },
];

export default function PaymentScreen({ navigation }) {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.methodButton}
      activeOpacity={0.7}
      onPress={() => {
        if (item.id === "mastercard") {
          navigation.navigate("CardDetail"); // zorg dat deze screen geregistreerd is in je navigator
        } else {
          alert(`Je klikte op ${item.name}`);
        }
      }}
    >
      <Image source={item.image} style={styles.methodImage} />
      <Text style={styles.methodText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Back arrow */}
      {/* <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
        accessibilityLabel="Ga terug"
      >
        <Icon name="arrow-back" size={28} color="#001D3D" />
      </TouchableOpacity> */}

      <Text style={styles.title}>Payment method</Text>

      <FlatList
        data={paymentMethods}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
  },
  backButton: {
    marginLeft: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#001D3D",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  methodButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDD",
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  methodImage: {
    width: 36,
    height: 36,
    resizeMode: "contain",
    marginRight: 18,
  },
  methodText: {
    fontSize: 18,
    color: "#000",
    fontWeight: "600",
    fontFamily: "HelveticaNeue-Medium", // optioneel, voor dat zachte lettertype
  },
});
