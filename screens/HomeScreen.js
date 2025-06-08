import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import { debounce } from "lodash";
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";

const isValidPlate = (plate) => {
  const regex = /^[1-9]-[A-Z]{3}-\d{3}$/;
  return regex.test(plate.toUpperCase());
};

const VehicleCard = ({ vehicle, selected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.vehicleCard,
      selected ? styles.vehicleCardSelected : styles.vehicleCardDefault,
    ]}
  >
    <View style={styles.vehicleCardHeader}>
      <Icon name="car" size={18} color={selected ? "#fff" : "#001D3D"} />
    </View>
    <Text style={[styles.vehicleCardTitle, selected && { color: "#fff" }]}>
      {vehicle.year} {vehicle.brand} {vehicle.model}
    </Text>
    <Text style={[styles.vehicleCardPlate, selected && { color: "#fff" }]}>
      {vehicle.plate}
    </Text>
    {selected && (
      <View style={styles.checkmark}>
        <Icon name="check-square" size={18} color="#fff" />
      </View>
    )}
  </TouchableOpacity>
);

export default function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [vehiclesModalVisible, setVehiclesModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [storedUserId, setStoredUserId] = useState(null);
  const [addingVehicle, setAddingVehicle] = useState(false);
  const [newBrand, setNewBrand] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newYear, setNewYear] = useState("");
  const [newPlate, setNewPlate] = useState("");
  const vehiclesWithAddButton = [...vehicles, { isAddButton: true }];
  const [carpoolAdVisible, setCarpoolAdVisible] = useState(false);
  const [region, setRegion] = useState({
    latitude: 50.8503,
    longitude: 4.3517,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  });
  const [loadingPremium, setLoadingPremium] = useState(true);

  // userId ophalen
  useEffect(() => {
    const getUserId = async () => {
      try {
        const id = await AsyncStorage.getItem("userId");
        if (id) setStoredUserId(id);
      } catch (err) {
        console.error("Error loading user ID:", err);
      }
    };
    getUserId();
  }, []);

  // premium status ophalen via API
  useEffect(() => {
    const fetchPremiumStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          setIsPremium(false);
          setLoadingPremium(false);
          return;
        }
        const response = await fetch(
          "https://raedar-backend.onrender.com/api/users",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        setIsPremium(data?.premium ?? false);
      } catch (error) {
        console.error("Error fetching premium status:", error);
        setIsPremium(false);
      } finally {
        setLoadingPremium(false);
      }
    };
    fetchPremiumStatus();
  }, []);

  // voertuigen ophalen
  useEffect(() => {
    if (!storedUserId) return;

    const fetchVehicles = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          console.warn("Geen token gevonden, kan voertuigen niet ophalen");
          return;
        }

        const response = await axios.get(
          "https://raedar-backend.onrender.com/api/vehicles",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userVehicles = response.data.filter(
          (v) => v.userId === storedUserId
        );
        setVehicles(userVehicles);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
      }
    };

    fetchVehicles();
  }, [storedUserId]);

  // locatie + events ophalen
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        setRegion((r) => ({
          ...r,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }));
      }
    })();

    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          "https://raedar-backend.onrender.com/api/events"
        );
        setEventsData(response.data);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };

    fetchEvents();
    setTimeout(() => setCarpoolAdVisible(true), 5000);
  }, []);

  // voertuig toevoegen
  const handleAddVehicle = async () => {
    if (!newBrand || !newModel || !newYear || !newPlate) {
      alert("Please fill in all fields.");
      return;
    }

    if (!isValidPlate(newPlate)) {
      alert("Enter a valid Belgian license plate, e.g., 1-ABC-123.");
      return;
    }

    try {
      let userId = storedUserId;

      if (!userId) {
        userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          alert("User not found.");
          return;
        }
        setStoredUserId(userId);
      }

      const response = await axios.post(
        "https://raedar-backend.onrender.com/api/vehicles",
        {
          brand: newBrand,
          model: newModel,
          year: newYear,
          plate: newPlate.toUpperCase(),
          userId: userId,
        }
      );

      const saved = response.data;
      setVehicles((prev) => [saved, ...prev]);
      setAddingVehicle(false);
      setNewBrand("");
      setNewModel("");
      setNewYear("");
      setNewPlate("");
    } catch (err) {
      console.error("Error adding car:", err);
      alert("Adding vehicle failed.");
    }
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    setVehiclesModalVisible(false);
  };

  const debouncedSearch = debounce(async (text) => {
    setSearchQuery(text);
    if (!text) return setSuggestions([]);

    const filtered = eventsData
      .flatMap((e) => e.events || [])
      .filter((event) =>
        event.title.toLowerCase().includes(text.toLowerCase())
      );

    setSuggestions(filtered);
  }, 300);

  const handleSuggestionPress = (event) => {
    setSelectedEvent(event);
    setFilterVisible(false);
    setSuggestions([]);
    setSearchQuery("");

    setRegion({
      latitude: event.latitude,
      longitude: event.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  if (loadingPremium) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#001D3D" />
        <Text>Loading user data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
      >
        {userLocation && (
          <Marker coordinate={userLocation}>
            <View style={styles.locationDotOuter}>
              <View style={styles.locationDotInner} />
            </View>
          </Marker>
        )}

        {eventsData
          .flatMap((item) => item.events)
          .map((event, index) => (
            <React.Fragment key={`event-${index}`}>
              <Marker
                coordinate={{
                  latitude: event.latitude,
                  longitude: event.longitude,
                }}
                onPress={() => {
                  setSelectedEvent(event);
                  setRegion({
                    latitude: event.latitude,
                    longitude: event.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  });
                }}
              >
                <Image
                  source={require("../assets/pin-icon3.png")}
                  style={styles.pinIcon}
                />
              </Marker>
            </React.Fragment>
          ))}
      </MapView>

      {/* CARPOOL AD */}
      <Modal visible={carpoolAdVisible} animationType="fade" transparent={true}>
        <View style={styles.carpoolAdOverlay}>
          <View style={styles.carpoolAdBox}>
            <Image
              source={require("../assets/carpool.png")}
              style={styles.carpoolImage}
            />
            <Text style={styles.carpoolAdTitle}>
              🌍 Think about the planet!
            </Text>
            <Text style={styles.carpoolAdText}>
              Carpool to events and help reduce CO₂ emissions. Together, we make
              a difference!
            </Text>
            <TouchableOpacity
              onPress={() => setCarpoolAdVisible(false)}
              style={styles.carpoolAdCloseButton}
            >
              <Text style={{ color: "white", textAlign: "center" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* VEHICLE MODAL */}
      {vehiclesModalVisible && (
        <Modal
          visible={true}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setVehiclesModalVisible(false)}
        >
          <View style={styles.filterContainer}>
            <View
              style={[styles.filterBox, { height: addingVehicle ? 360 : 250 }]}
            >
              <Text style={styles.filterTitle}>
                {addingVehicle ? "Add new vehicle" : "Select your vehicle"}
              </Text>

              {addingVehicle ? (
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="Brand"
                    value={newBrand}
                    onChangeText={setNewBrand}
                    style={styles.input}
                  />
                  <TextInput
                    placeholder="Model"
                    value={newModel}
                    onChangeText={setNewModel}
                    style={styles.input}
                  />
                  <TextInput
                    placeholder="Year"
                    value={newYear}
                    onChangeText={setNewYear}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                  <TextInput
                    placeholder="1-ABC-123"
                    placeholderTextColor="#999"
                    value={newPlate}
                    onChangeText={(text) => setNewPlate(text.toUpperCase())}
                    autoCapitalize="characters"
                    style={styles.input}
                  />

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      onPress={() => setAddingVehicle(false)}
                      style={[styles.button, styles.cancelButton]}
                    >
                      <Text style={styles.cancelButtonText}>Close</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleAddVehicle}
                      style={[styles.button, styles.addButton]}
                    >
                      <Text style={styles.addButtonText}>Add Vehicle</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  <FlatList
                    horizontal
                    data={vehiclesWithAddButton}
                    keyExtractor={(item) =>
                      item._id ||
                      item.id ||
                      (item.isAddButton
                        ? "add-button"
                        : Math.random().toString())
                    }
                    contentContainerStyle={{ gap: 10, paddingHorizontal: 10 }}
                    showsHorizontalScrollIndicator={true}
                    renderItem={({ item }) => {
                      if (item.isAddButton) {
                        return (
                          <TouchableOpacity
                            style={styles.addVehicleButton}
                            onPress={() => setAddingVehicle(true)}
                          >
                            <Icon name="plus" size={30} color="#001D3D" />
                          </TouchableOpacity>
                        );
                      }
                      return (
                        <VehicleCard
                          vehicle={item}
                          selected={selectedVehicle?.plate === item.plate}
                          onPress={() => handleVehicleSelect(item)}
                        />
                      );
                    }}
                  />
                </>
              )}
              {/* Ads banner for non-premium */}
              {/* {!isPremium && (
                <View style={styles.adBanner}>
                  <Text style={styles.adText}>
                    ✨ Upgrade to Premium for an ad-free experience!
                  </Text>
                  <TouchableOpacity
                    style={styles.adButton}
                    onPress={() => navigation.navigate("Premium")}
                  >
                    <Text style={styles.adButtonText}>Go Premium</Text>
                  </TouchableOpacity>
                </View>
              )} */}

              {!addingVehicle && (
                <TouchableOpacity
                  onPress={() => setVehiclesModalVisible(false)}
                  style={styles.closeModalButton}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      )}

      {/* Filter modal */}
      {filterVisible && (
        <Modal visible={true} animationType="fade" transparent={true}>
          <View style={styles.filterContainer}>
            <View style={styles.filterBox}>
              <Text style={styles.filterTitle}>Search for an Event</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Type event name..."
                value={searchQuery}
                onChangeText={(text) => debouncedSearch(text)}
              />
              <FlatList
                data={suggestions}
                keyExtractor={(item, idx) => idx.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => handleSuggestionPress(item)}
                  >
                    <Text>{item.title}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={styles.closeFilterButton}
                onPress={() => setFilterVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Event detail modal */}
      {selectedEvent && (
        <Modal visible={true} animationType="slide" transparent={true}>
          <TouchableOpacity
            style={styles.overlay}
            onPress={() => setSelectedEvent(null)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.eventModalContainer}>
                {selectedEvent.imageName && (
                  <Image
                    source={{
                      uri: `https://raedar-backend.onrender.com${selectedEvent.imageName}`,
                    }}
                    style={styles.eventImage}
                  />
                )}
                <View style={styles.eventModalBox}>
                  <Text style={styles.eventModalTitle}>
                    {selectedEvent.title}
                  </Text>
                  <Text>{selectedEvent.description}</Text>
                  <Text>Location: {selectedEvent.location}</Text>
                  <Text>Date: {selectedEvent.date}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      const eventToSend = selectedEvent; // bewaar huidige event
                      setSelectedEvent(null); // sluit modal
                      if (isPremium) {
                        navigation.navigate("EventDetailScreen", {
                          event: eventToSend,
                        });
                      } else {
                        navigation.navigate("ParkingDetail", {
                          parking: eventToSend,
                        });
                      }
                    }}
                    style={styles.goToParkingButton}
                  >
                    <Text style={styles.goToParkingText}>See parking</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setSelectedEvent(null)}
                    style={styles.closeModalButton}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      <TouchableOpacity
        style={styles.openFilterButton}
        onPress={() => setFilterVisible(true)}
      >
        <Icon name="filter" size={20} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.vehicleButton}
        onPress={() => setVehiclesModalVisible(true)}
      >
        <Image
          source={require("../assets/vehicle.png")}
          style={styles.vehicleIcon}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },
  pinIcon: { width: 20, height: 30, resizeMode: "contain" },
  filterContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  filterBox: {
    width: "85%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
  },
  filterTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  searchInput: {
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 8,
    borderRadius: 8,
  },
  suggestionItem: { padding: 10 },
  closeFilterButton: {
    marginTop: 10,
    backgroundColor: "#EB6534",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: { color: "white" },
  openFilterButton: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "#001D3D",
    padding: 10,
    borderRadius: 30,
  },
  vehiclesButton: {
    position: "absolute",
    bottom: 80,
    left: 20,
    backgroundColor: "#EB6534",
    padding: 10,
    borderRadius: 50,
  },
  vehiclesButtonText: { color: "white" },
  eventModalContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  eventModalBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: "90%",
    marginTop: 10,
  },
  eventModalTitle: { fontSize: 20, fontWeight: "bold" },
  eventImage: {
    width: "90%",
    height: 200,
    borderRadius: 10,
    resizeMode: "cover",
    top: 10,
  },
  goToParkingButton: {
    marginTop: 10,
    backgroundColor: "#001D3D",
    padding: 10,
    borderRadius: 5,
  },
  goToParkingText: { color: "white", textAlign: "center" },
  overlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  selectedVehicleContainer: {
    position: "absolute",
    bottom: 170,
    left: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
  },
  vehicleCard: {
    width: 120,
    height: 150,
    borderRadius: 15,
    padding: 12,
    justifyContent: "center",
    backgroundColor: "#F2F2F2",
    position: "relative",
  },
  vehicleCardDefault: { backgroundColor: "#F2F2F2" },
  vehicleCardSelected: { backgroundColor: "#EB6534" },
  vehicleCardHeader: { marginBottom: 6 },
  vehicleCardTitle: { fontWeight: "bold", fontSize: 15, color: "#001D3D" },
  vehicleCardPlate: { fontSize: 13, color: "#888" },
  checkmark: { position: "absolute", bottom: 10, right: 10 },
  addVehicleButton: {
    width: 120, // gelijk aan voertuigkaart breedte
    height: 150, // gelijk aan voertuigkaart hoogte
    borderRadius: 15,
    backgroundColor: "#E6E6E6",
    justifyContent: "center",
    alignItems: "center",
  },
  locationDotOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0, 29, 61, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  locationDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#001D3D",
  },
  carpoolAdBox: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    width: "80%",
    alignItems: "center",
    top: "50%",
    left: "10%",
  },
  carpoolAdTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#001D3D",
  },
  carpoolAdText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  carpoolAdCloseButton: {
    backgroundColor: "#EB6534",
    padding: 10,
    borderRadius: 8,
    width: "100%",
  },
  carpoolImage: {
    width: 270,
    height: 200,
    resizeMode: "cover",
    borderRadius: 10,
    marginBottom: 15,
  },
  inputContainer: {
    gap: 10,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F9F9F9",
    fontSize: 15,
    color: "#333",
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    flex: 1,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: "#EB6534",
    flex: 1,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  cancelButtonText: {
    color: "#333",
  },
  vehicleButton: {
    position: "absolute",
    bottom: 40,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    shadowColor: "#001D3D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 99,
  },

  vehicleIcon: {
    width: 60,
    height: 60,
    marginRight: 12,
    resizeMode: "contain",
  },
  vehicleText: {
    fontSize: 16,
    color: "#001D3D",
    fontWeight: "600",
  },
  adBanner: {
    position: "absolute",
    bottom: 110,
    left: 20,
    right: 20,
    backgroundColor: "#FFE5B4",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 100,
  },
  adText: {
    color: "#333",
    fontSize: 14,
    flex: 1,
    flexWrap: "wrap",
  },
  adButton: {
    backgroundColor: "#EB6534",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginLeft: 10,
  },
  adButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
