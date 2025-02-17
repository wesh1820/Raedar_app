import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axios from 'axios';

const ParkingDetailScreen = ({ route, navigation }) => {
  const { event, parking } = route.params;
  const [ticket, setTicket] = useState(null);

  // Function to create and add a ticket to the MongoDB database
  const createTicket = async () => {
    console.log("Create Ticket Button Pressed");
  
    const newTicket = {
      type: ` ${parking.location}`, // Include parking location in the ticket name
      price: parking.price,
      availability: 1, // Assume 1 ticket available
    };
  
    console.log('Ticket data to be sent:', newTicket);
  
    try {
      const response = await axios.post('https://raedar-backend.onrender.com/api/tickets', newTicket);
  
      console.log('Response from server:', response.data);
      if (response.status === 200) {
        setTicket(response.data.ticket);
        Alert.alert(
          'Ticket Created',
          `You have successfully created a ticket for ${parking.location} at the price of ${parking.price}.`
        );
  
        // Navigate to the MainTab and then to TicketScreen
        navigation.navigate('Main', {
          screen: 'Tickets', // Navigate to the 'Tickets' tab in MainTabs
          params: { newTicket: response.data.ticket }, // Pass the new ticket data as params
        });
      } else {
        Alert.alert('Error', 'Failed to create ticket. Try again.');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      if (error.response) {
        console.log('Error response:', error.response);
      }
      Alert.alert('Error', 'There was an error creating the ticket. Please try again.');
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
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    backgroundColor: '#001D3D',
    color: '#fff',
    padding: 15,
    borderRadius: 15,
  },
  parkingInfo: {
    fontSize: 18,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#EB6534',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ticketInfo: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
});

export default ParkingDetailScreen;
