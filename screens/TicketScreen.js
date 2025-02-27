// src/screens/TicketScreen.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // For retrieving the token

const TicketScreen = ({ navigation, route }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken"); // Retrieve token from AsyncStorage
        console.log("Token retrieved: ", token); // Check token value

        if (!token) {
          setError("Unauthorized access. Please log in.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "https://raedar-backend.onrender.com/api/tickets/user-tickets", // Assuming this is the correct route
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Response status: ", response.status); // Log the response status

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText} (${response.status})`);
        }

        const data = await response.json();
        console.log("Fetched tickets data: ", data); // Log the fetched data

        setTickets(data.tickets);
      } catch (err) {
        console.error("Error fetching tickets: ", err); // Log the error
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();

    // If a new ticket is added via navigation, update the list
    if (route.params?.newTicket) {
      setTickets((prevTickets) => [...prevTickets, route.params.newTicket]);
    }
  }, [route.params?.newTicket]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Display a message if there are no tickets */}
      {tickets.length === 0 ? (
        <Text style={styles.noTicketsText}>There are no tickets available</Text>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.ticketContainer}
              onPress={() =>
                navigation.navigate("TicketDetail", { ticket: item })
              }
            >
              <Text style={styles.ticketName}>{item.type}</Text>
              <Text style={styles.ticketPrice}>{item.price}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  ticketContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 15,
    backgroundColor: "#001D3D",
    borderRadius: 15,
  },
  ticketName: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "bold",
  },
  ticketPrice: {
    fontSize: 14,
    color: "#ffffff",
    marginTop: 5,
  },
  noTicketsText: {
    fontSize: 18,
    color: "gray",
    textAlign: "center",
    marginTop: 20,
  },
});

export default TicketScreen;
