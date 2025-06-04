import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import QRCode from "react-native-qrcode-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TicketDetailScreen = ({ route }) => {
  const { ticket } = route.params;
  const [remainingTime, setRemainingTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startedAt, setStartedAt] = useState(null);

  // Bereken endTime op basis van starttijd + duration
  const calculateEndTime = (start) => {
    return new Date(new Date(start).getTime() + ticket.duration * 60 * 1000);
  };

  // Laad timer status uit AsyncStorage bij mount
  useEffect(() => {
    const loadTimer = async () => {
      try {
        const storedTimers = await AsyncStorage.getItem("timers");
        const timers = storedTimers ? JSON.parse(storedTimers) : {};

        if (timers[ticket._id] && timers[ticket._id].isRunning) {
          setIsRunning(true);
          setStartedAt(timers[ticket._id].startedAt);
          updateRemaining(timers[ticket._id].startedAt);
        } else {
          // Timer niet gestart, dus initialiseer remaining op volledige tijd
          setRemainingTime(ticket.duration * 60 * 1000);
        }
      } catch (error) {
        console.log("Error loading timer:", error);
        setRemainingTime(ticket.duration * 60 * 1000);
      }
    };
    loadTimer();
  }, [ticket._id, ticket.duration]);

  // Update resterende tijd elke seconde
  useEffect(() => {
    if (!isRunning || !startedAt) return;

    const interval = setInterval(() => {
      updateRemaining(startedAt);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, startedAt]);

  // Functie om resterende tijd te berekenen en bij te werken
  const updateRemaining = (start) => {
    const endTime = calculateEndTime(start);
    const now = new Date();
    const diff = endTime - now;
    if (diff <= 0) {
      setRemainingTime(0);
      setIsRunning(false);
      saveTimerStatus(false, start); // Stop timer opslaan
    } else {
      setRemainingTime(diff);
    }
  };

  // Sla timerstatus op in AsyncStorage
  const saveTimerStatus = async (running, startTime) => {
    try {
      const storedTimers = await AsyncStorage.getItem("timers");
      const timers = storedTimers ? JSON.parse(storedTimers) : {};

      timers[ticket._id] = {
        isRunning: running,
        startedAt: startTime || null,
      };

      await AsyncStorage.setItem("timers", JSON.stringify(timers));
    } catch (error) {
      console.log("Error saving timer status:", error);
    }
  };

  // Start de timer als er op de QR-code wordt gedrukt
  const onQrCodePress = () => {
    if (isRunning) return; // timer al gestart

    const now = new Date().toISOString();
    setIsRunning(true);
    setStartedAt(now);
    saveTimerStatus(true, now);
    setRemainingTime(ticket.duration * 60 * 1000);
  };

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

      <Text style={[styles.info, styles.timer]}>
        Resterende tijd: {formatCountdown(remainingTime)}
      </Text>

      <TouchableOpacity
        onPress={onQrCodePress}
        style={styles.qrContainer}
        activeOpacity={0.7}
      >
        <QRCode value={ticket._id} size={250} />
      </TouchableOpacity>

      {!isRunning && remainingTime > 0 && (
        <Text style={styles.startHint}>
          Klik op de QR-code om de timer te starten
        </Text>
      )}

      {!isRunning && remainingTime === 0 && (
        <Text style={[styles.startHint, { color: "red" }]}>Timer verlopen</Text>
      )}
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
    marginTop: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  startHint: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: "bold",
    color: "#EB6534",
  },
});

export default TicketDetailScreen;
