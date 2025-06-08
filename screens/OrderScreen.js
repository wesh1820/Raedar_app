import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Animated,
  Switch,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Notifications from "expo-notifications";

const OrderScreen = ({ route, navigation }) => {
  const { ticket } = route.params || {};
  const [vehicle, setVehicle] = useState(null);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [error, setError] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const loadVehicle = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          setError("Geen gebruiker gevonden (userId is leeg).");
          return;
        }

        const token = await AsyncStorage.getItem("userToken");
        const res = await axios.get(
          "https://raedar-backend.onrender.com/api/vehicles",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("✅ Fetched vehicles:", res.data);

        const userVehicle = res.data.find((v) => v.userId === userId);
        if (!userVehicle) {
          setError("Geen voertuig gevonden voor deze gebruiker.");
        } else {
          setVehicle(userVehicle);
        }
      } catch (err) {
        console.error("❌ Fout bij laden voertuig:", err);
        setError("Er ging iets mis bij het ophalen van je voertuig.");
      }
    };

    loadVehicle();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const scheduleNotification = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Toegang geweigerd", "Notificaties zijn uitgeschakeld.");
      return;
    }

    if (ticket.date) {
      const eventDate = new Date(ticket.date);
      eventDate.setHours(9);
      eventDate.setMinutes(0);
      eventDate.setSeconds(0);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Reminder voor je event 🎉",
          body: `Vandaag is het zover! Vergeet je parkeerbewijs niet.`,
        },
        trigger: eventDate,
      });
    }
  };

  const handlePay = async () => {
    const basePrice = parseFloat(ticket.price);
    const fee = parseFloat((basePrice * 0.2).toFixed(2));
    const totalPrice = parseFloat((basePrice + fee).toFixed(2));

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Niet ingelogd", "Je moet eerst inloggen om te betalen.");
        return;
      }

      if (reminderEnabled) {
        await scheduleNotification();
      }

      await axios.patch(
        `https://raedar-backend.onrender.com/api/tickets/${ticket._id}`,
        { price: totalPrice },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await axios.post(
        "https://raedar-backend.onrender.com/api/tickets/payment/confirm",
        {
          ticketId: ticket._id,
          amount: Number(totalPrice),
          vehicleId: vehicle?._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("Succes", "Betaling bevestigd!");
      navigation.navigate("MainTabs", { screen: "Tickets" });
    } catch (err) {
      console.error("❌ Betaling mislukt:", err);
      Alert.alert(
        "Fout",
        err?.response?.data?.error || "Er ging iets mis bij de betaling."
      );
    }
  };

  if (!ticket) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No ticket found.</Text>
      </View>
    );
  }

  const basePrice = parseFloat(ticket.price);
  const fee = parseFloat((basePrice * 0.2).toFixed(2));
  const totalPrice = parseFloat((basePrice + fee).toFixed(2));

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.title}>Order detail</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.block}>
        <Text style={styles.blockLabel}>DURATION</Text>
        <Text style={styles.blockValue}>{ticket.duration} min</Text>
      </View>

      {vehicle && (
        <View style={styles.ticketCard}>
          <Text style={styles.sectionLabel}>VEHICLE</Text>
          <Text style={styles.sectionValue}>
            {vehicle.year} {vehicle.brand} {vehicle.model} • {vehicle.plate}
          </Text>

          <Text style={[styles.sectionLabel, { marginTop: 16 }]}>
            PARKING LOT
          </Text>
          <Text style={styles.sectionValue}>{ticket.type}</Text>

          <Text style={styles.slotInfo}>Slot A01</Text>

          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Base Price</Text>
            <Text style={styles.feeValue}>€{basePrice.toFixed(2)}</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>+ 20% Transaction Fee</Text>
            <Text style={styles.feeValue}>€{fee.toFixed(2)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalText}>TOTAL</Text>
            <Text style={styles.totalPrice}>€{totalPrice.toFixed(2)}</Text>
          </View>
        </View>
      )}

      <View style={styles.reminderBox}>
        <Text style={styles.reminderLabel}>Reminder received</Text>
        <Switch
          value={reminderEnabled}
          onValueChange={setReminderEnabled}
          trackColor={{ false: "#ccc", true: "#FFB88C" }}
          thumbColor={reminderEnabled ? "#EB6534" : "#001D3D"}
        />
      </View>

      <TouchableOpacity style={styles.payButton} onPress={handlePay}>
        <Text style={styles.payText}>Confirm & Pay</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9faff",
    padding: 24,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#001D3D",
    marginBottom: 30,
  },
  block: {
    marginBottom: 25,
  },
  blockLabel: {
    fontWeight: "bold",
    color: "#001D3D",
    fontSize: 16,
  },
  blockValue: {
    color: "#62718E",
    fontSize: 18,
    marginTop: 6,
  },
  ticketCard: {
    backgroundColor: "#f0f4f8",
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
  },
  sectionLabel: {
    fontSize: 14,
    color: "#62718E",
    fontWeight: "bold",
  },
  sectionValue: {
    fontSize: 18,
    color: "#001D3D",
    fontWeight: "bold",
    marginTop: 4,
  },
  slotInfo: {
    fontSize: 16,
    color: "#EB6534",
    fontWeight: "bold",
    marginTop: 4,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  feeLabel: {
    fontSize: 14,
    color: "#62718E",
  },
  feeValue: {
    fontSize: 14,
    color: "#62718E",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    borderTopWidth: 2,
    borderTopColor: "#EB6534",
    paddingTop: 16,
  },
  totalText: {
    color: "#62718E",
    fontSize: 16,
    fontWeight: "bold",
  },
  totalPrice: {
    color: "#001D3D",
    fontSize: 20,
    fontWeight: "bold",
  },
  payButton: {
    backgroundColor: "#001D3D",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  payText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    marginBottom: 20,
  },
  reminderBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  reminderLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#001D3D",
  },
});

export default OrderScreen;
