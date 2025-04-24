import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";

const TicketDetailScreen = ({ route }) => {
  const { ticket } = route.params;
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    const createdAt = new Date(ticket.createdAt);
    const endTime = new Date(createdAt.getTime() + ticket.duration * 60 * 1000);

    const updateRemaining = () => {
      const now = new Date();
      const diff = endTime - now;
      setRemainingTime(Math.max(diff, 0));
    };

    updateRemaining(); // initial calculation
    const interval = setInterval(updateRemaining, 1000);

    return () => clearInterval(interval);
  }, [ticket.createdAt, ticket.duration]);

  const formatCountdown = (ms) => {
    if (ms <= 0) return "Verlopen";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}u ${minutes}m ${seconds}s`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{ticket.type}</Text>
      <Text style={styles.info}>Price: {ticket.price}</Text>
      <Text style={styles.info}>Availability: {ticket.availability}</Text>
      <Text style={styles.info}>Duration: {ticket.duration} min</Text>
      <Text style={styles.info}>
        Created At: {new Date(ticket.createdAt).toLocaleString()}
      </Text>

      {/* Timer display */}
      <Text style={[styles.info, styles.timer]}>
        Resterende tijd: {formatCountdown(remainingTime)}
      </Text>

      {/* QR Code */}
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
    alignItems: "center",
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
  info: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: "bold",
  },
  timer: {
    color: "#EB6534",
  },
  qrContainer: {
    marginTop: 125,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
});

export default TicketDetailScreen;
