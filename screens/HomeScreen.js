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
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import { debounce } from "lodash";
import Icon from "react-native-vector-icons/FontAwesome";

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

export function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [vehiclesModalVisible, setVehiclesModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const vehicles = [
    { id: 1, brand: "Audi", model: "Q3", year: 2021, plate: "B 1234 CD" },
    { id: 2, brand: "BMW", model: "X2", year: 2021, plate: "B 5632 DM" },
  ];

  const [region, setRegion] = useState({
    latitude: 50.8503,
    longitude: 4.3517,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  });

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();

    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          "https://raedar-backend.onrender.com/api/events"
        );
        setEventsData(response.data);
      } catch (err) {
        console.error("❌ Error fetching events:", err);
      }
    };

    fetchEvents();
  }, []);

  const debouncedSearch = debounce((text) => {
    setSearchQuery(text);
    if (text.length > 0) {
      const filtered = eventsData
        .flatMap((e) => e.events)
        .filter((event) =>
          event.title.toLowerCase().includes(text.toLowerCase())
        );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, 300);

  const handleSuggestionPress = (event) => {
    setSearchQuery(event.title);
    setSuggestions([]);
    setRegion({
      latitude: event.latitude,
      longitude: event.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
    setSelectedEvent(event);
    setFilterVisible(false);
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    setVehiclesModalVisible(false);
  };

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
                onPress={() => setSelectedEvent(event)}
              >
                <Image
                  source={require("../assets/pin-icon3.png")}
                  style={styles.pinIcon}
                />
              </Marker>

              {event.parkings &&
                event.parkings.map((parking, pIndex) => (
                  <Marker
                    key={`parking-${index}-${pIndex}`}
                    coordinate={{
                      latitude: parseFloat(parking.latitude),
                      longitude: parseFloat(parking.longitude),
                    }}
                    title={parking.location}
                    description={`Capacity: ${parking.capacity}, €${parking.price}`}
                  >
                    <Image
                      source={require("../assets/pin-icon2.png")}
                      style={styles.pinIcon}
                    />
                  </Marker>
                ))}
            </React.Fragment>
          ))}
      </MapView>

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
                      navigation.navigate("EventDetailScreen", {
                        event: selectedEvent,
                      });
                      setSelectedEvent(null);
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
        style={styles.vehiclesButton}
        onPress={() => setVehiclesModalVisible(true)}
      >
        <Text style={styles.vehiclesButtonText}>Voertuigen</Text>
      </TouchableOpacity>

      {/* Vehicle modal */}
      {vehiclesModalVisible && (
        <Modal visible={true} animationType="fade" transparent={true}>
          <View style={styles.filterContainer}>
            <View style={[styles.filterBox, { height: 250 }]}>
              <Text style={styles.filterTitle}>Select your vehicle</Text>
              <FlatList
                horizontal
                data={vehicles}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ gap: 10 }}
                renderItem={({ item }) => (
                  <VehicleCard
                    vehicle={item}
                    selected={selectedVehicle?.id === item.id}
                    onPress={() => handleVehicleSelect(item)}
                  />
                )}
              />
              <TouchableOpacity
                style={styles.addVehicleButton}
                onPress={() => console.log("Add new vehicle")}
              >
                <Icon name="plus" size={20} color="#001D3D" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {selectedVehicle && (
        <View style={styles.selectedVehicleContainer}>
          <Text>
            Selected Vehicle: {selectedVehicle.brand} {selectedVehicle.model}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Alles uit jouw originele styles hier...
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
    width: "100%",
    height: 180,
    borderRadius: 10,
    resizeMode: "cover",
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
    bottom: 150,
    left: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
  },
  vehicleCard: {
    width: 160,
    height: 120,
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
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#E6E6E6",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginLeft: 10,
  },
});

export default HomeScreen;
