import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  ImageBackground,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const headerImage = require("../assets/premium.png");

const PremiumScreen = () => {
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [pendingCancellation, setPendingCancellation] = useState(false);
  const [premiumEndDate, setPremiumEndDate] = useState(null);
  const [token, setToken] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const userToken = await AsyncStorage.getItem("userToken");
      if (!userToken) return;

      setToken(userToken);

      try {
        const res = await fetch(
          "https://raedar-backend.onrender.com/api/users",
          {
            headers: { Authorization: `Bearer ${userToken}` },
          }
        );
        const data = await res.json();
        const expireDate = data.premiumEndDate
          ? new Date(data.premiumEndDate)
          : null;
        const now = new Date();

        if (data.premium && expireDate && expireDate > now) setIsPremium(true);
        else setIsPremium(false);

        setPremiumEndDate(expireDate);
        setPendingCancellation(data.premiumCancelPending || false);
      } catch (err) {
        console.log("❌ Error:", err);
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const cancelPremium = async () => {
    Alert.alert("Cancel Premium", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: async () => {
          setLoading(true);
          try {
            const res = await fetch(
              "https://raedar-backend.onrender.com/api/users/premium/cancel",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            const data = await res.json();
            if (data.success) {
              Alert.alert("Premium cancelled.");
              setPendingCancellation(true);
            }
          } catch {
            Alert.alert("Error", "Please try again later.");
          }
          setLoading(false);
        },
      },
    ]);
  };

  const purchasePremium = async (type) => {
    setShowModal(false);
    setLoading(true);
    try {
      const res = await fetch(
        "https://raedar-backend.onrender.com/api/users/premium",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ premiumType: type }),
        }
      );
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        Alert.alert(
          "Success",
          `Premium activated (${
            type === "month" ? "€4.99/month" : "€49.99/year"
          })!`
        );
        setIsPremium(true);
        setPendingCancellation(false);
        setPremiumEndDate(
          type === "month"
            ? new Date(new Date().setMonth(new Date().getMonth() + 1))
            : new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        );
      } else {
        Alert.alert("Error", data.error || "Could not activate premium.");
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "There was a problem with the server.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ImageBackground
        source={headerImage}
        style={styles.header}
        resizeMode="cover"
      />

      <View style={styles.cardContainer}>
        <Text style={styles.sectionTitle}>Benefits</Text>
        <Text style={styles.bullet}>• No ads 🚫</Text>
        <Text style={styles.bullet}>• Exclusive features ⭐️</Text>
        <Text style={styles.bullet}>• Fast support ⚡️</Text>
        <Text style={styles.bullet}>• Free parking notifications 🔔</Text>
      </View>

      {isPremium && (
        <Text style={styles.paymentLabel}>
          Active until:{" "}
          {premiumEndDate
            ? new Date(premiumEndDate).toLocaleDateString()
            : "Unknown"}
        </Text>
      )}

      {isPremium && pendingCancellation && (
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            Premium cancelled – active until{" "}
            {premiumEndDate
              ? new Date(premiumEndDate).toLocaleDateString()
              : "end of the month"}
            .
          </Text>
        </View>
      )}

      {isPremium && !pendingCancellation && (
        <TouchableOpacity style={styles.cancelButton} onPress={cancelPremium}>
          <Text style={styles.cancelText}>Cancel Premium</Text>
        </TouchableOpacity>
      )}

      {!isPremium && (
        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.cancelText}>Get Premium</Text>
        </TouchableOpacity>
      )}

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Your Plan</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => purchasePremium("month")}
            >
              <Text style={styles.modalButtonText}>€4.99/month</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => purchasePremium("year")}
            >
              <Text style={styles.modalButtonText}>€49.99/year</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default PremiumScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContainer: {
    backgroundColor: "#F1F5F9",
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 20,
    padding: 20,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#001D3D",
    marginBottom: 12,
  },
  bullet: {
    fontSize: 16,
    color: "#4B5563",
    marginVertical: 4,
  },
  paymentLabel: {
    marginTop: 30,
    marginLeft: 24,
    fontSize: 16,
    fontWeight: "bold",
    color: "#001D3D",
  },
  cancelButton: {
    backgroundColor: "#001D3D",
    marginTop: 30,
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  subscribeButton: {
    backgroundColor: "#EB6534",
    marginTop: 30,
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  cancelText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  noticeBox: {
    marginTop: 20,
    backgroundColor: "#FFF3CD",
    padding: 16,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  noticeText: {
    color: "#856404",
    fontSize: 15,
    textAlign: "center",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 16,
    width: "90%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#001D3D",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#001D3D",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginVertical: 8,
  },
  modalButtonText: { color: "#fff", fontSize: 16 },
  modalCancel: {
    color: "#EB6534",
    marginTop: 15,
    fontSize: 16,
    fontWeight: "bold",
  },
});
