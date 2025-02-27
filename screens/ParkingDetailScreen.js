import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ParkingDetailScreen = ({ route, navigation }) => {
  const { event, parking } = route.params;
  const [ticket, setTicket] = useState(null);
  const [userToken, setUserToken] = useState(null); // State to store userToken

  // Use useEffect to get the token when the screen is mounted
  useEffect(() => {
    const getUserToken = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken"); // Retrieve token
        if (token) {
          setUserToken(token); // Set the token in state
        } else {
          Alert.alert("Error", "You are not logged in.");
          navigation.navigate("LoginScreen"); // Optionally, navigate to login if no token found
        }
      } catch (error) {
        console.error("Error retrieving user token:", error);
      }
    };

    getUserToken();
  }, []);

  // Function to create a ticket
  const createTicket = async () => {
    if (!userToken) {
      Alert.alert("Error", "You must be logged in to create a ticket.");
      return;
    }

    const newTicket = {
      type: `${parking.location}`,
      price: parking.price,
      availability: 1,
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

      console.log("Response from server:", response.data);

      if (response.status >= 200 && response.status < 300) {
        setTicket(response.data.ticket);
        Alert.alert(
          "Ticket Created",
          `You have successfully created a ticket for ${parking.location} at the price of ${parking.price}.`
        );

        // Voeg een timeout toe om zeker te zijn dat het alert eerst verschijnt
        setTimeout(() => {
          navigation.navigate("Main", { screen: "Tickets" });
        }, 500);
      } else {
        Alert.alert("Error", "Failed to create ticket. Try again.");
      }
    } catch (error) {
      console.error("Error creating ticket:", error);

      if (error.response) {
        console.log("Error response:", error.response.data);
        Alert.alert(
          "API Fout",
          error.response.data.message || "Er ging iets mis."
        );
      } else {
        Alert.alert("Netwerkfout", "Kan geen verbinding maken met de server.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{parking.location}</Text>
      <Text style={styles.parkingInfo}>Capacity: {parking.capacity}</Text>
      <Text style={styles.parkingInfo}>Price: {parking.price}</Text>

      {/* Orange Button using TouchableOpacity */}
      <TouchableOpacity style={styles.button} onPress={createTicket}>
        <Text style={styles.buttonText}>Book Parking</Text>
      </TouchableOpacity>

      {ticket && (
        <View style={styles.ticketInfo}>
          <Text>Ticket Created:</Text>
          <Text>Event ID: {ticket.eventId}</Text>
          <Text>Type: {ticket.type}</Text>
          <Text>Price: {ticket.price}</Text>
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
    textAlign: "center",
    marginVertical: 20,
    backgroundColor: "#001D3D",
    color: "#fff",
    padding: 15,
    borderRadius: 15,
  },
  parkingInfo: {
    fontSize: 18,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#EB6534",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  ticketInfo: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
});

export default ParkingDetailScreen;
