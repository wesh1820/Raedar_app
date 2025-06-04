import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const TicketScreen = ({ navigation, route }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timers, setTimers] = useState({});

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          setError("Geen token gevonden. Log opnieuw in.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "https://raedar-backend.onrender.com/api/tickets",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Fout bij ophalen tickets: ${response.statusText} (${response.status})`
          );
        }

        const data = await response.json();
        setTickets(data.tickets);
        await initializeTimers(data.tickets);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Timer initialiseren vanuit AsyncStorage en tickets data
  const initializeTimers = async (ticketsList) => {
    const now = new Date();
    const timersMap = {};

    const storedTimers = await AsyncStorage.getItem("timers");
    const storedTimersParsed = storedTimers ? JSON.parse(storedTimers) : {};

    ticketsList.forEach((ticket) => {
      const durationMs = ticket.duration * 60 * 1000;
      const timerData = storedTimersParsed[ticket._id];

      if (timerData && timerData.isRunning && timerData.startedAt) {
        const startedAt = new Date(timerData.startedAt);
        const endTime = new Date(startedAt.getTime() + durationMs);
        const remaining = endTime - now;

        timersMap[ticket._id] = {
          remaining: Math.max(remaining, 0),
          isRunning: remaining > 0,
          startedAt: timerData.startedAt,
        };
      } else {
        timersMap[ticket._id] = {
          remaining: durationMs,
          isRunning: false,
          startedAt: null,
        };
      }
    });

    setTimers(timersMap);
  };

  // Herlaad timers bij scherm focus (als je terugkomt van detail)
  useFocusEffect(
    useCallback(() => {
      initializeTimers(tickets);
    }, [tickets])
  );

  // Timer loopt elke seconde door voor actieve timers
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const updated = {};
        Object.entries(prev).forEach(
          ([id, { remaining, isRunning, startedAt }]) => {
            if (isRunning && startedAt) {
              const ticket = tickets.find((t) => t._id === id);
              if (!ticket) {
                updated[id] = { remaining, isRunning, startedAt };
                return;
              }
              const durationMs = ticket.duration * 60 * 1000;
              const startTime = new Date(startedAt);
              const endTime = new Date(startTime.getTime() + durationMs);
              const now = new Date();
              const diff = endTime - now;

              if (diff <= 0) {
                updated[id] = { remaining: 0, isRunning: false, startedAt };
                saveTimerStatus(id, false, startedAt);
              } else {
                updated[id] = { remaining: diff, isRunning: true, startedAt };
                saveTimerStatus(id, true, startedAt);
              }
            } else {
              updated[id] = { remaining, isRunning, startedAt };
            }
          }
        );
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tickets]);

  // Opslaan timerstatus in AsyncStorage
  const saveTimerStatus = async (id, running, startedAt) => {
    try {
      const storedTimers = await AsyncStorage.getItem("timers");
      const timers = storedTimers ? JSON.parse(storedTimers) : {};

      timers[id] = {
        isRunning: running,
        startedAt,
      };

      await AsyncStorage.setItem("timers", JSON.stringify(timers));
    } catch (error) {
      console.log("Error saving timer status:", error);
    }
  };

  const formatCountdown = (ms) => {
    if (ms <= 0) return "Verlopen";

    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours > 0 ? hours + "u " : ""}${minutes}m ${seconds}s`;
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <Text>Bezig met laden...</Text>;
  }

  if (error) {
    return <Text>Fout: {error}</Text>;
  }

  return (
    <View style={styles.container}>
      {tickets.length === 0 ? (
        <Text style={styles.noTicketsText}>
          Er zijn geen tickets beschikbaar
        </Text>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Actieve Tickets</Text>

          <FlatList
            data={tickets}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => {
              const timer = timers[item._id];
              const timeLeft = timer?.remaining ?? item.duration * 60 * 1000;
              const countdown = formatCountdown(timeLeft);
              const isRunning = timer?.isRunning ?? false;

              return (
                <TouchableOpacity
                  style={styles.ticketContainer}
                  onPress={() =>
                    navigation.navigate("TicketDetail", { ticket: item })
                  }
                >
                  <View style={styles.orangeBar} />
                  <View style={styles.ticketContent}>
                    <Text style={styles.ticketName}>{item.type}</Text>
                    <Text style={styles.ticketDate}>
                      {formatDate(item.createdAt)}
                    </Text>
                    <Text style={styles.countdown}>{countdown}</Text>

                    {!isRunning && timeLeft > 0 && (
                      <TouchableOpacity
                        style={styles.activateButton}
                        onPress={() =>
                          navigation.navigate("TicketDetail", { ticket: item })
                        }
                      >
                        <Text style={styles.buttonText}>Scan QR Code</Text>
                      </TouchableOpacity>
                    )}

                    {!isRunning && timeLeft === 0 && (
                      <Text style={{ color: "red", marginTop: 8 }}>
                        Timer verlopen
                      </Text>
                    )}

                    {isRunning && (
                      <Text style={{ color: "green", marginTop: 8 }}>
                        Timer loopt
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />

          <Text style={styles.sectionFooter}>Verlopen Tickets</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    marginTop: 100,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    paddingHorizontal: 15,
    marginBottom: 40,
    color: "#001D3D",
  },
  sectionFooter: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    padding: 20,
    color: "gray",
  },
  ticketContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 15,
    backgroundColor: "#E9EAEC",
  },
  orangeBar: {
    width: 5,
    height: "100%",
    backgroundColor: "#EB6534",
    borderRadius: 0,
    marginRight: 15,
  },
  ticketContent: {
    flex: 1,
    padding: 10,
  },
  ticketName: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "bold",
  },
  ticketDate: {
    fontSize: 14,
    color: "#5D6F83",
    marginTop: 5,
  },
  countdown: {
    fontSize: 14,
    color: "#EB6534",
    fontWeight: "600",
    marginTop: 5,
  },
  noTicketsText: {
    fontSize: 18,
    color: "gray",
    textAlign: "center",
    marginTop: 20,
  },
  activateButton: {
    marginTop: 8,
    backgroundColor: "#001D3D",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  buttonText: {
    color: "white",
  },
});

export default TicketScreen;
