import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  Animated,
  Switch,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Notifications from "expo-notifications";

const PaymentScreen = ({ route, navigation }) => {
  const { ticket } = route.params || {};
  const [vehicle, setVehicle] = useState(null);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const loadVehicle = async () => {
      const userId = await AsyncStorage.getItem("userId");
      const res = await axios.get(
        "https://raedar-backend.onrender.com/api/vehicles"
      );
      const userVehicle = res.data.find((v) => v.userId === userId);
      setVehicle(userVehicle);
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
    if (reminderEnabled) {
      await scheduleNotification();
    }

    Alert.alert("Succes", "Betaling bevestigd!");
    navigation.navigate("Main", { screen: "Tickets" });
  };

  if (!ticket) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Geen ticket gevonden.</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.title}>Order detail</Text>

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

          <Text style={[styles.slotInfo]}>Slot A01</Text>

          <View style={styles.totalRow}>
            <Text style={styles.totalText}>TOTAL</Text>
            <Text style={styles.totalPrice}>
              €{parseFloat(ticket.price).toFixed(2)}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.reminderBox}>
        <Text style={styles.reminderLabel}>Reminder ontvangen</Text>
        <Switch
          value={reminderEnabled}
          onValueChange={setReminderEnabled}
          trackColor={{ false: "#ccc", true: "#EB6534" }}
          thumbColor={reminderEnabled ? "#001D3D" : "#888"}
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

export default PaymentScreen;
