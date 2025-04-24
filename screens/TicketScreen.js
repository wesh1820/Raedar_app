import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
        initializeTimers(data.tickets);
      } catch (err) {
        console.error("Fout bij ophalen tickets: ", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();

    if (route.params?.newTicket) {
      setTickets((prevTickets) => [...prevTickets, route.params.newTicket]);
    }
  }, [route.params?.newTicket]);

  const initializeTimers = async (tickets) => {
    const now = new Date();
    const timersMap = {};

    // Laad timers op uit AsyncStorage
    const storedTimers = await AsyncStorage.getItem("timers");
    const storedTimersParsed = storedTimers ? JSON.parse(storedTimers) : {};

    tickets.forEach((ticket) => {
      const createdAt = new Date(ticket.createdAt);
      const end = new Date(createdAt.getTime() + ticket.duration * 60 * 1000);
      const remaining = end - now;

      // Zet de timerstatus naar de opgeslagen waarde, als die er is
      timersMap[ticket._id] = {
        remaining: Math.max(remaining, 0),
        isRunning: storedTimersParsed[ticket._id]?.isRunning || false,
      };
    });

    setTimers(timersMap);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const updated = {};
        Object.entries(prev).forEach(([id, { remaining, isRunning }]) => {
          if (isRunning) {
            updated[id] = {
              remaining: Math.max(remaining - 1000, 0),
              isRunning,
            };

            // Update de timer in AsyncStorage
            AsyncStorage.setItem(
              "timers",
              JSON.stringify({
                ...prev,
                [id]: { remaining: updated[id].remaining, isRunning },
              })
            );
          } else {
            updated[id] = { remaining, isRunning };
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleStartTimer = (ticketId) => {
    Alert.alert(
      "Weet je het zeker?",
      "Zodra de timer is gestart, kun je deze niet meer stoppen.",
      [
        {
          text: "Annuleren",
          style: "cancel",
        },
        {
          text: "Bevestigen",
          onPress: () => {
            setTimers((prev) => {
              const newTimers = {
                ...prev,
                [ticketId]: { ...prev[ticketId], isRunning: true },
              };

              // Sla de nieuwe timerstatus op in AsyncStorage
              AsyncStorage.setItem("timers", JSON.stringify(newTimers));

              return newTimers;
            });
          },
        },
      ]
    );
  };

  const formatCountdown = (ms) => {
    if (ms <= 0) return "Verlopen";

    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}u ${minutes}m ${seconds}s`;
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
              const timeLeft = timers[item._id]?.remaining;
              const countdown = formatCountdown(timeLeft);

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

                    {/* Display the "Activate Timer" button only if the timer is not running */}
                    {!timers[item._id]?.isRunning && (
                      <TouchableOpacity
                        style={styles.activateButton}
                        onPress={() => handleStartTimer(item._id)}
                      >
                        <Text style={styles.buttonText}>Activeer Timer</Text>
                      </TouchableOpacity>
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
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#EB6534",
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default TicketScreen;
