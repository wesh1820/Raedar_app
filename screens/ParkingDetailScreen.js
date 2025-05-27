import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/FontAwesome5";

const ParkingDetailScreen = ({ route, navigation }) => {
  const { event, parking } = route.params;
  const [ticket, setTicket] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const pricePerHour = 1.3; // hardcoded prijs
  const totalDurationInMinutes = hours * 60 + minutes;

  useEffect(() => {
    const getUserToken = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) setUserToken(token);
        else {
          Alert.alert("Error", "You are not logged in.");
          navigation.navigate("LoginScreen");
        }
      } catch (error) {
        console.error("Error retrieving user token:", error);
        Alert.alert("Error", "Failed to retrieve authentication token.");
      }
    };

    getUserToken();
  }, []);

  useEffect(() => {
    const durationInHours = totalDurationInMinutes / 60;
    setTotalPrice(pricePerHour * durationInHours);
  }, [hours, minutes]);

  const createTicket = async () => {
    if (!userToken) {
      Alert.alert("Error", "You must be logged in to create a ticket.");
      return;
    }

    const newTicket = {
      type: `${parking.location}`,
      price: totalPrice,
      availability: 1,
      duration: totalDurationInMinutes,
    };

    try {
      const response = await axios.post(
        "https://raedar-backend.onrender.com/api/tickets",
        newTicket,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        setTicket(response.data.ticket);
        Alert.alert(
          "Ticket Created",
          `Je hebt succesvol een ticket aangemaakt voor ${parking.location}.`
        );
        setTimeout(() => {
          navigation.navigate("Main", { screen: "Tickets" });
        }, 500);
      } else {
        Alert.alert("Error", "Failed to create ticket. Try again.");
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      if (error.response?.status === 401) {
        Alert.alert("Unauthorized", "Session expired. Please log in again.");
        navigation.navigate("LoginScreen");
      } else {
        Alert.alert(
          "API Error",
          error.response?.data?.message || "An error occurred while creating the ticket."
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>PARKING DETAIL</Text>

      <Image source={require("../assets/parking.png")} style={styles.parkingImage} />

      <View style={styles.headerContent}>
        <View>
          <Text style={styles.title}>{parking.name || "Parking"}</Text>
          <Text style={styles.subtitle}>{parking.location}</Text>
        </View>
        <Icon name="bookmark" size={22} color="#1B263B" />
      </View>

      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Icon name="warehouse" size={14} color="#1B263B" />
          <Text style={styles.badgeText}>{parking.capacity}</Text>
        </View>
        <View style={styles.badge}>
          <Icon name="clock" size={14} color="#1B263B" />
          <Text style={styles.badgeText}>15u - 23u</Text>
        </View>
      </View>

      <Text style={styles.rulesTitle}>RULES</Text>
      <Text style={styles.rulesText}>
        These rules and regulations for the use of <Text style={{ fontWeight: "bold" }}>{parking.name || "this parking"}</Text>. In these Rules, unless the context otherwise requires...
        <Text style={styles.more}> more...</Text>
      </Text>

      <View style={styles.row}>
        <View style={styles.slotsBox}>
          <View style={styles.indicator} />
          <Text style={styles.slotsText}>{parking.capacity} slots available</Text>
        </View>
        <View style={styles.slotsBox}>
          <View style={styles.indicator} />
          <Text style={styles.slotsText}>€1.30/h</Text>
        </View>
      </View>

      {/* Picker terug hieronder */}
      <View style={styles.row}>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Uren</Text>
          <Picker
            selectedValue={hours.toString()}
            style={styles.picker}
            onValueChange={(value) => setHours(parseInt(value))}
          >
            {[...Array(24).keys()].map((i) => (
              <Picker.Item key={i} label={`${i} uur`} value={i.toString()} />
            ))}
          </Picker>
        </View>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Minuten</Text>
          <Picker
            selectedValue={minutes.toString()}
            style={styles.picker}
            onValueChange={(value) => setMinutes(parseInt(value))}
          >
            {[0, 15, 30, 45].map((min) => (
              <Picker.Item key={min} label={`${min} min`} value={min.toString()} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.slotsBox}>
          <Text style={styles.slotsText}>Duur: {totalDurationInMinutes} minuten</Text>
        </View>
        <View style={styles.slotsBox}>
          <Text style={styles.slotsText}>Totaal: €{totalPrice.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.bookButton} onPress={createTicket}>
        <Text style={styles.bookText}>Book Parking</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // jouw style code zoals eerder, die laat je zoals het was
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  sectionLabel: { fontSize: 12, fontWeight: "bold", color: "#1B263B", letterSpacing: 1.2, marginBottom: 10 },
  parkingImage: { width: "100%", height: 150, borderRadius: 10, marginBottom: 20 },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  title: { fontSize: 24, fontWeight: "bold", color: "#000" },
  subtitle: { fontSize: 14, color: "#5D6A77" },
  badgeRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  badge: { flexDirection: "row", backgroundColor: "#F0F4F8", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, alignItems: "center", gap: 6 },
  badgeText: { color: "#1B263B", fontWeight: "600" },
  rulesTitle: { fontWeight: "700", marginBottom: 6, color: "#1B263B", fontSize: 14 },
  rulesText: { color: "#5D6A77", fontSize: 14, lineHeight: 22, marginBottom: 20 },
  more: { color: "#1B263B", fontWeight: "600" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  slotsBox: { flex: 1, backgroundColor: "#F0F4F8", paddingVertical: 14, paddingHorizontal: 12, borderRadius: 10, flexDirection: "row", alignItems: "center", gap: 10 },
  indicator: { width: 4, height: "100%", backgroundColor: "#EB6534", borderRadius: 3 },
  slotsText: { fontWeight: "600", color: "#1B263B", flexShrink: 1 },
  pickerContainer: { flex: 1, marginRight: 10 },
  pickerLabel: { fontSize: 16, marginBottom: 5 },
  picker: { height: 150, width: "100%" },
  bookButton: { backgroundColor: "#001D3D", paddingVertical: 16, borderRadius: 12, alignItems: "center", marginTop: 10 },
  bookText: { color: "white", fontWeight: "bold", fontSize: 16 },
});

export default ParkingDetailScreen;
