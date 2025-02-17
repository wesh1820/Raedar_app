import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg'; // Import QR Code library

const TicketDetailScreen = ({ route }) => {
  const { ticket } = route.params; // Receive ticket details

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{ticket.type}</Text>
      <Text style={styles.info}>Price: {ticket.price}</Text>
      <Text style={styles.info}>Availability: {ticket.availability}</Text>
      <Text style={styles.info}>Created At: {new Date(ticket.createdAt).toLocaleString()}</Text>

      {/* QR Code for ticket */}
      <View style={styles.qrContainer}>
        <QRCode value={ticket._id} size={250} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
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
  info: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: 'bold',
  },
  qrContainer: {
    marginTop: 125,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
});

export default TicketDetailScreen;
