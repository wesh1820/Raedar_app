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

const VehicleCard = ({ vehicle, selected, onPress }) => {
  return (
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
};


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
    { id: 1, brand: "Audi", model: "Q3", year: 2021, plate: "B 1234 CD" },
    { id: 2, brand: "BMW", model: "X2", year: 2021, plate: "B 5632 DM" },
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

      {/* 🔶 Orange parking tag */}
<View style={styles.parkingTag}>
  <Text style={styles.parkingTagText}>Parking Goovaerts →</Text>
</View>

{/* 🎯 Location button (right bottom corner) */}
<TouchableOpacity style={styles.locateButton}>
  <Icon name="crosshairs" size={18} color="white" />
</TouchableOpacity>

{/* 🔍 Search bar (bottom center) */}
<View style={styles.searchBarWrapper}>
  <View style={styles.searchBar}>
    <Icon name="search" size={16} color="#001D3D" />
    <TextInput
      placeholder="Search for your destination"
      placeholderTextColor="#999"
      style={styles.searchInput}
    />
    <Icon name="microphone" size={16} color="#001D3D" />
  </View>
</View>


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

  parkingTag: {
    position: "absolute",
    top: 130,
    alignSelf: "center",
    backgroundColor: "#EB6534",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    zIndex: 10,
  },
  parkingTagText: {
    color: "#fff",
    fontWeight: "bold",
  },
  
  locateButton: {
    position: "absolute",
    bottom: 160,
    right: 20,
    backgroundColor: "#001D3D",
    padding: 12,
    borderRadius: 100,
    elevation: 5,
  },
  
  searchBarWrapper: {
    position: "absolute",
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 10,
    color: "#001D3D",
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
  vehicleCardDefault: {
    backgroundColor: "#F2F2F2",
  },
  vehicleCardSelected: {
    backgroundColor: "#EB6534",
  },
  vehicleCardHeader: {
    marginBottom: 6,
  },
  vehicleCardTitle: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#001D3D",
  },
  vehicleCardPlate: {
    fontSize: 13,
    color: "#888",
  },
  checkmark: {
    position: "absolute",
    bottom: 10,
    right: 10,
  },
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
