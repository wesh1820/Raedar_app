import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import axios from "axios";
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";

const isValidPlate = (plate) => {
  const regex = /^[1-9]-[A-Z]{3}-\d{3}$/;
  return regex.test(plate.toUpperCase());
};

const VehicleCard = ({ vehicle, onPress }) => (
  <TouchableOpacity
    style={styles.vehicleCard}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.vehicleIconContainer}>
      <Icon name="car" size={26} color="#EB6534" />
    </View>
    <View style={styles.vehicleInfo}>
      <Text style={styles.label}>Car:</Text>
      <Text style={styles.vehicleTitle}>
        {vehicle.year} {vehicle.brand} {vehicle.model}
      </Text>
      <Text style={styles.label}>License Plate:</Text>
      <Text style={styles.vehiclePlate}>{vehicle.plate}</Text>
    </View>
  </TouchableOpacity>
);

export default function VehiclesScreen() {
  const [vehicles, setVehicles] = useState([]);
  const [storedUserId, setStoredUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [plate, setPlate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const id = await AsyncStorage.getItem("userId");
        const tkn = await AsyncStorage.getItem("userToken");
        if (id) setStoredUserId(id);
        if (tkn) setToken(tkn);
      } catch (err) {
        console.error("Error loading user data:", err);
      }
    };
    getUserData();
  }, []);

  useEffect(() => {
    if (!storedUserId || !token) return;

    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "https://raedar-backend.onrender.com/api/vehicles",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const userVehicles = response.data.filter(
          (v) => v.userId === storedUserId
        );
        setVehicles(userVehicles);
      } catch (err) {
        Alert.alert("Error", "Could not fetch vehicles.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [storedUserId, token]);

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setBrand(vehicle.brand);
    setModel(vehicle.model);
    setYear(vehicle.year.toString());
    setPlate(vehicle.plate);
    setModalVisible(true);
  };

  const resetForm = () => {
    setBrand("");
    setModel("");
    setYear("");
    setPlate("");
    setEditingVehicle(null);
  };

  const saveVehicle = async () => {
    if (!brand.trim() || !model.trim() || !year.trim() || !plate.trim()) {
      Alert.alert("Attention", "Please fill in all fields.");
      return;
    }
    if (!isValidPlate(plate)) {
      Alert.alert(
        "Invalid License Plate",
        "Enter a valid Belgian license plate, 1-ABC-123."
      );
      return;
    }
    if (!token) {
      Alert.alert("Error", "You are not logged in.");
      return;
    }

    setSaving(true);

    try {
      if (editingVehicle) {
        const response = await axios.put(
          `https://raedar-backend.onrender.com/api/vehicles/${editingVehicle._id}`,
          {
            brand: brand.trim(),
            model: model.trim(),
            year: Number(year.trim()),
            plate: plate.toUpperCase().trim(),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setVehicles((v) =>
          v.map((veh) => (veh._id === editingVehicle._id ? response.data : veh))
        );
      } else {
        const response = await axios.post(
          "https://raedar-backend.onrender.com/api/vehicles",
          {
            brand: brand.trim(),
            model: model.trim(),
            year: Number(year.trim()),
            plate: plate.toUpperCase().trim(),
            userId: storedUserId,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setVehicles((v) => [response.data, ...v]);
      }
      resetForm();
      setModalVisible(false);
    } catch (error) {
      console.log(error.response?.data || error.message);
      Alert.alert("Error", "Could not save vehicle.");
    } finally {
      setSaving(false);
    }
  };

  const deleteVehicle = (vehicle) => {
    Alert.alert(
      "Delete?",
      `Are you sure you want to delete "${vehicle.brand} ${vehicle.model}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!token) {
              Alert.alert("Error", "You are not logged in.");
              return;
            }
            try {
              await axios.delete(
                `https://raedar-backend.onrender.com/api/vehicles/${vehicle._id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              setVehicles((v) => v.filter((veh) => veh._id !== vehicle._id));
              if (editingVehicle?._id === vehicle._id) resetForm();
            } catch (err) {
              console.log("Delete error:", err.response?.data || err.message);
              Alert.alert("Error", "Could not delete vehicle.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#EB6534" />
        <Text style={{ marginTop: 10, fontSize: 16, color: "#666" }}>
          Loading vehicles...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={<Text style={styles.pageTitle}>My Vehicles</Text>}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            You haven't added any vehicles yet.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.vehicleRow}>
            <VehicleCard vehicle={item} onPress={() => openEditModal(item)} />
            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => openEditModal(item)}
                accessibilityLabel={`Edit ${item.brand} ${item.model}`}
              >
                <Icon name="pencil" size={20} color="#001D3D" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteVehicle(item)}
                accessibilityLabel={`Delete ${item.brand} ${item.model}`}
              >
                <Icon name="trash" size={20} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
      />

      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Icon name="plus" size={28} color="white" />
        <Text style={styles.addButtonText}>New Vehicle</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalWrapper}
        >
          <View style={styles.modalContent}>
            <Text style={styles.formTitle}>
              {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
            </Text>
            <TextInput
              placeholder="Brand"
              value={brand}
              onChangeText={setBrand}
              style={styles.input}
              returnKeyType="next"
              placeholderTextColor="#999"
            />
            <TextInput
              placeholder="Model"
              value={model}
              onChangeText={setModel}
              style={styles.input}
              returnKeyType="next"
              placeholderTextColor="#999"
            />
            <TextInput
              placeholder="Year"
              value={year}
              onChangeText={setYear}
              keyboardType="numeric"
              style={styles.input}
              returnKeyType="next"
              placeholderTextColor="#999"
              maxLength={4}
            />
            <TextInput
              placeholder="1-ABC-123"
              value={plate}
              onChangeText={(text) => setPlate(text.toUpperCase())}
              autoCapitalize="characters"
              style={styles.input}
              returnKeyType="done"
              placeholderTextColor="#999"
              maxLength={9}
            />
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, saving && { opacity: 0.7 }]}
                onPress={saveVehicle}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? "Saving..." : editingVehicle ? "Save" : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F7" },
  centered: { justifyContent: "center", alignItems: "center" },
  pageTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#001D3D",
    marginBottom: 20,
    paddingHorizontal: 20,
    fontFamily: "HelveticaNeue-Medium",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#AAA",
    fontStyle: "italic",
    fontSize: 16,
  },
  vehicleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
    shadowColor: "#EB6534",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  vehicleCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  vehicleIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: "#FFEDD9",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  vehicleInfo: {
    flexShrink: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#999",
    marginBottom: 2,
  },
  vehicleTitle: {
    fontWeight: "700",
    fontSize: 20,
    color: "#001D3D",
    marginBottom: 8,
  },
  vehiclePlate: {
    fontSize: 18,
    color: "#666",
    fontWeight: "700",
  },
  buttonsRow: {
    flexDirection: "row",
  },
  editButton: {
    backgroundColor: "001D3D",
    padding: 6,
    marginRight: 14,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "001D3D",
    padding: 6,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    position: "absolute",
    bottom: 50,
    right: 92,
    backgroundColor: "#001D3D",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    elevation: 6,
  },
  addButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 18,
    marginLeft: 10,
  },
  modalWrapper: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#EB6534",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 20,
    color: "#001D3D",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#001D3D",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fffff",
    fontSize: 16,
    color: "#333",
    marginBottom: 16,
    fontWeight: "600",
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelButton: {
    backgroundColor: "#D8D8D8",
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 14,
    marginRight: 14,
  },
  cancelButtonText: {
    color: "#444",
    fontWeight: "700",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#EB6534",
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 14,
    shadowColor: "#EB6534",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 1,
  },
});
