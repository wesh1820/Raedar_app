import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Animated,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TicketDetailScreen = ({ route }) => {
  const { ticket } = route.params;

  const [remainingTime, setRemainingTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  const calculateEndTime = (start) => {
    return new Date(new Date(start).getTime() + ticket.duration * 60 * 1000);
  };

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
          setRemainingTime(ticket.duration * 60 * 1000);
        }
      } catch (error) {
        setRemainingTime(ticket.duration * 60 * 1000);
      }
    };
    loadTimer();
  }, [ticket._id, ticket.duration]);

  useEffect(() => {
    if (!isRunning || !startedAt) return;

    const interval = setInterval(() => {
      updateRemaining(startedAt);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, startedAt]);

  const updateRemaining = (start) => {
    const endTime = calculateEndTime(start);
    const now = new Date();
    const diff = endTime - now;
    if (diff <= 0) {
      setRemainingTime(0);
      setIsRunning(false);
      saveTimerStatus(false, start);
    } else {
      setRemainingTime(diff);
    }
  };

  const saveTimerStatus = async (running, startTime) => {
    try {
      const storedTimers = await AsyncStorage.getItem("timers");
      const timers = storedTimers ? JSON.parse(storedTimers) : {};

      timers[ticket._id] = {
        isRunning: running,
        startedAt: startTime || null,
      };

      await AsyncStorage.setItem("timers", JSON.stringify(timers));
    } catch (error) {}
  };

  const onQrCodePress = () => {
    if (isRunning) return;
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

  const openGoogleMapsRoute = () => {
    if (ticket.latitude && ticket.longitude) {
      const destination = `${ticket.latitude},${ticket.longitude}`;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
      Linking.openURL(url);
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.ticketBox}>
        <Text style={styles.title}>{ticket.type}</Text>

        <View style={styles.sectionBox}>
          <Text style={styles.label}>Prijs:</Text>
          <Text style={styles.value}>€{ticket.price}</Text>
        </View>

        <View style={styles.sectionBox}>
          <Text style={styles.label}>Beschikbaarheid:</Text>
          <Text style={styles.value}>{ticket.availability}</Text>
        </View>

        <View style={styles.sectionBox}>
          <Text style={styles.label}>Duur:</Text>
          <Text style={styles.value}>{ticket.duration} minuten</Text>
        </View>

        <View style={styles.sectionBox}>
          <Text style={styles.label}>Aangemaakt op:</Text>
          <Text style={styles.value}>
            {new Date(ticket.createdAt).toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.routeButton}
          onPress={openGoogleMapsRoute}
        >
          <Text style={styles.routeButtonText}>Route naar parking</Text>
        </TouchableOpacity>

        <Text style={styles.timer}>
          Resterende tijd: {formatCountdown(remainingTime)}
        </Text>

        <TouchableOpacity
          onPress={onQrCodePress}
          style={styles.qrContainer}
          activeOpacity={0.8}
        >
          <QRCode value={ticket._id} size={220} />
        </TouchableOpacity>

        {!isRunning && remainingTime === 0 && (
          <Text style={styles.expired}>Timer verlopen</Text>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  ticketBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 25,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B263B",
    textAlign: "center",
    marginBottom: 25,
  },
  sectionBox: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#333",
  },
  value: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#001D3D",
  },
  routeButton: {
    backgroundColor: "#EB6534",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 25,
    alignSelf: "center",
  },
  routeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  timer: {
    marginTop: 25,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "#EB6534",
  },
  qrContainer: {
    marginTop: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  expired: {
    marginTop: 20,
    fontSize: 16,
    color: "red",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default TicketDetailScreen;
