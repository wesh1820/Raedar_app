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
import Icon from "react-native-vector-icons/FontAwesome"; // <-- Voeg dit toe voor iconen

export function HomeScreen({ navigation }) {
  const [region, setRegion] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false); // Filter is initially hidden
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [vehiclesModalVisible, setVehiclesModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const vehicles = [
    { id: 1, name: "BMW serie 3" },
    { id: 2, name: "Mercedes CLA" },
    { id: 3, name: "Honda sniperdex" },
  ];

  const debouncedSearch = debounce((text) => {
    setSearchQuery(text);
    if (text.length > 0) {
      const filtered = eventsData
        .flatMap((event) => event.events)
        .filter((event) =>
          event.title.toLowerCase().includes(text.toLowerCase())
        );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, 300);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return;
      }
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();

    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          "https://raedar-backend.onrender.com/api/events"
        );
        setEventsData(response.data);
      } catch (error) {
        console.error("❌ Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

  const handleSearch = (text) => {
    debouncedSearch(text);
  };

  const handleSuggestionPress = (event) => {
    setSearchQuery(event.title);
    setSuggestions([]);
    setRegion({
      latitude: event.latitude,
      longitude: event.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
    setSelectedEvent(event); // 👈 Trigger popup
    setFilterVisible(false); // Close filter modal when selecting event
  };

  const handleMarkerPress = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseEventModal = () => {
    setSelectedEvent(null);
  };

  const handleGoToEventDetails = () => {
    if (selectedEvent) {
      navigation.navigate("EventDetailScreen", { event: selectedEvent });
      setSelectedEvent(null);
    }
  };

  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    setVehiclesModalVisible(false); // Close vehicle modal after selection
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={handleRegionChange}
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
            <Marker
              key={index}
              coordinate={{
                latitude: event.latitude,
                longitude: event.longitude,
              }}
              onPress={() => handleMarkerPress(event)}
            >
              <Image
                source={require("../assets/pin-icon3.png")}
                style={styles.pinIcon}
              />
            </Marker>
          ))}
      </MapView>

      {/* Filter modal */}
      {filterVisible && (
        <Modal visible={filterVisible} animationType="fade" transparent={true}>
          <View style={styles.filterContainer}>
            <View style={styles.filterBox}>
              <Text style={styles.filterTitle}>Search for an Event</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Type event name..."
                value={searchQuery}
                onChangeText={handleSearch}
              />
              <FlatList
                data={suggestions}
                keyExtractor={(item, index) => index.toString()}
                style={styles.suggestionsList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSuggestionPress(item)}
                    style={styles.suggestionItem}
                  >
                    <Text>{item.title}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                onPress={() => setFilterVisible(false)}
                style={styles.closeFilterButton}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Event detail modal */}
      {selectedEvent && (
        <Modal
          visible={true}
          animationType="slide"
          transparent={true}
          onRequestClose={handleCloseEventModal}
        >
          <TouchableOpacity
            style={styles.overlay}
            onPress={handleCloseEventModal}
          >
            {selectedEvent.imageName && (
              <View style={styles.modalContainer}>
                <View style={styles.eventModalContainer}>
                  <Image
                    source={{
                      uri: `https://raedar-backend.onrender.com${selectedEvent.imageName}`,
                    }}
                    style={styles.eventImage}
                  />
                  <View style={styles.eventModalBox}>
                    <Text style={styles.eventModalTitle}>
                      {selectedEvent.title}
                    </Text>
                    <Text>{selectedEvent.description}</Text>
                    <Text>Location: {selectedEvent.location}</Text>
                    <Text>Date: {selectedEvent.date}</Text>

                    <TouchableOpacity
                      onPress={handleGoToEventDetails}
                      style={styles.goToParkingButton}
                    >
                      <Text style={styles.goToParkingText}>See parking</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleCloseEventModal}
                      style={styles.closeModalButton}
                    >
                      <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </TouchableOpacity>
        </Modal>
      )}

      {/* Open Filter button with icon */}
      <TouchableOpacity
        style={styles.openFilterButton}
        onPress={() => setFilterVisible(true)}
      >
        <Icon name="filter" size={20} color="white" /> {/* Filter icoon */}
      </TouchableOpacity>

      {/* Voertuigen button */}
      <TouchableOpacity
        style={styles.vehiclesButton}
        onPress={() => setVehiclesModalVisible(true)} // Show vehicle modal
      >
        <Text style={styles.vehiclesButtonText}>Voertuigen</Text>
      </TouchableOpacity>

      {/* Vehicle selection modal */}
      {vehiclesModalVisible && (
        <Modal
          visible={vehiclesModalVisible}
          animationType="fade"
          transparent={true}
        >
          <View style={styles.filterContainer}>
            <View style={styles.filterBox}>
              <Text style={styles.filterTitle}>Select a Vehicle</Text>
              <FlatList
                data={vehicles}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleVehicleSelect(item)}
                    style={styles.suggestionItem}
                  >
                    <Text>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                onPress={() => setVehiclesModalVisible(false)} // Close modal
                style={styles.closeFilterButton}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Selected vehicle display */}
      {selectedVehicle && (
        <View style={styles.selectedVehicleContainer}>
          <Text>Selected Vehicle: {selectedVehicle.name}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },
  filterContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  filterBox: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  searchInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  suggestionsList: {
    marginTop: 10,
    maxHeight: 150,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  pinIcon: { width: 15, height: 25 },
  openFilterButton: {
    position: "absolute",
    bottom: 610,
    right: 20,
    backgroundColor: "#001D3D",
    padding: 10,
    borderRadius: 50,
  },
  closeFilterButton: {
    marginTop: 10,
    backgroundColor: "#EB6534",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
  },
  vehiclesButton: {
    position: "absolute",
    bottom: 80,
    left: 20,
    backgroundColor: "#EB6534",
    padding: 10,
    borderRadius: 50,
  },
  vehiclesButtonText: {
    color: "white",
  },
  eventModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  eventModalBox: {
    width: "80%",
    backgroundColor: "rgba(254, 254, 254, 0.98)",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  eventModalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
  },
  eventImage: {
    width: "80%",
    height: 200,
    borderRadius: 10,
  },
  goToParkingButton: {
    marginTop: 10,
    backgroundColor: "#001D3D",
    padding: 10,
    borderRadius: 5,
  },
  goToParkingText: {
    color: "white",
    fontSize: 16,
  },
  closeModalButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "transparent",
    padding: 10,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  vehiclesButton: {
    position: "absolute",
    bottom: 80,
    left: 20,
    backgroundColor: "#EB6534",
    padding: 10,
    borderRadius: 50,
  },
  vehiclesButtonText: {
    color: "white",
  },
  selectedVehicleContainer: {
    position: "absolute",
    bottom: 150,
    left: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
  },
});

export default HomeScreen;
