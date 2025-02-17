import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

const TicketScreen = ({ navigation, route }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('https://raedar-backend.onrender.com/api/tickets');
        if (!response.ok) {
          throw new Error('Something went wrong while fetching tickets');
        }
        const data = await response.json();
        setTickets(data);
      } catch (err) {
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

      <FlatList
        data={tickets}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.ticketContainer}
            onPress={() => navigation.navigate('TicketDetail', { ticket: item })}
          >
            <Text style={styles.ticketName}>{item.type}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  ticketContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 15,
    backgroundColor: '#001D3D',
    borderRadius: 15,
  },
  ticketName: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default TicketScreen;
