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
import Icon from "react-native-vector-icons/FontAwesome5"; // Improved icon set

const ParkingDetailScreen = ({ route, navigation }) => {
  const { event, parking } = route.params;
  const [ticket, setTicket] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(0);
  const [totalPrice, setTotalPrice] = useState(parking?.price ?? 0);

  const totalDurationInMinutes = hours * 60 + minutes;

  useEffect(() => {
    const getUserToken = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          setUserToken(token);
        } else {
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
    const pricePerHour = parking?.price ?? 0;
    const durationInHours = totalDurationInMinutes / 60;
    setTotalPrice(pricePerHour * durationInHours);
  }, [hours, minutes, parking]);

  const createTicket = async () => {
    if (!userToken) {
      Alert.alert("Error", "You must be logged in to create a ticket.");
      return;
    }

    if (isNaN(totalPrice) || totalDurationInMinutes <= 0) {
      Alert.alert("Error", "Please select a valid parking duration.");
      return;
    }

    const newTicket = {
      type: `${parking.location}`,
      price: totalPrice,
      availability: 1,
      duration: totalDurationInMinutes,
    };

    console.log("Ticket data to be sent:", newTicket);

    try {
      const response = await axios.post(
        "https://raedar-backend.onrender.com/api/tickets",
        newTicket,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        setTicket(response.data.ticket);
        Alert.alert(
          "Ticket Created",
          `Je hebt succesvol een ticket aangemaakt voor ${
            parking.location
          } voor ${hours} uur en ${minutes} minuten. Totaal: €${totalPrice.toFixed(
            2
          )}.`
        );

        setTimeout(() => {
          navigation.navigate("Main", { screen: "Tickets" });
        }, 500);
      } else {
        Alert.alert("Error", "Failed to create ticket. Try again.");
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      if (error.response) {
        if (error.response.status === 401) {
          Alert.alert("Unauthorized", "Session expired. Please log in again.");
          navigation.navigate("LoginScreen");
        } else {
          Alert.alert(
            "API Error",
            error.response.data.message ||
              "An error occurred while creating the ticket."
          );
        }
      } else {
        Alert.alert("Network Error", "Unable to connect to the server.");
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Add Image Above Parking Name */}
      <Image
        source={require("../assets/parking.png")}
        style={styles.parkingImage}
      />

      <Text style={styles.title}>{parking.location}</Text>

      {/* Capacity and Price per hour in rectangles */}
      <View style={styles.row}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Capacity</Text>
          <Text style={styles.infoValue}>{parking.capacity}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Price per Hour</Text>
          <Text style={styles.infoValue}>€{parking.price}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Uren</Text>
          <Picker
            selectedValue={hours.toString()}
            style={styles.picker}
            onValueChange={(value) => setHours(parseInt(value, 10))}
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
            onValueChange={(value) => setMinutes(parseInt(value, 10))}
          >
            {[0, 15, 30, 45].map((min) => (
              <Picker.Item
                key={min}
                label={`${min} min`}
                value={min.toString()}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Duration and Total Price in a row */}
      <View style={styles.row}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Duur</Text>
          <Text style={styles.infoValue}>{totalDurationInMinutes} minuten</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Totale prijs</Text>
          <Text style={styles.infoValue}>
            {typeof totalPrice === "number"
              ? `€${totalPrice.toFixed(2)}`
              : "Bezig met berekenen..."}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={createTicket}>
        <Icon name="check-circle" size={30} color="white" />
        <Text style={styles.buttonText}>Boek Parkeerplek</Text>
      </TouchableOpacity>

      {ticket && (
        <View style={styles.ticketInfo}>
          <Icon name="ticket-alt" size={30} color="#EB6534" />
          <Text>🎟️ Ticket Created:</Text>
          <Text>Event ID: {ticket.eventId}</Text>
          <Text>Type: {ticket.type}</Text>
          <Text>Price: €{ticket.price}</Text>
          <Text>Availability: {ticket.availability}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "left",
    color: "#000",
    marginVertical: 10,
  },
  parkingImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 20,
  },
  parkingInfo: {
    fontSize: 18,
    marginBottom: 10,
    marginVertical: 40,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  pickerContainer: {
    flex: 1,
    marginRight: 10,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  picker: {
    height: 150,
    width: "100%",
  },
  infoBox: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    fontSize: 15,
    color: "#000",
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#EB6534",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 18,
    color: "#000",
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#EB6534",
  },
  button: {
    backgroundColor: "#EB6534",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  ticketInfo: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
});

export default ParkingDetailScreen;
