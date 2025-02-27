import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, Image, FlatList, TouchableWithoutFeedback } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

export function HomeScreen({ navigation }) {
  const [region, setRegion] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [eventDetails, setEventDetails] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [eventsData, setEventsData] = useState([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
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
        const response = await axios.get('https://raedar-backend.onrender.com/api/events');
        setEventsData(response.data);
      } catch (error) {
        console.error('❌ Error fetching events:', error);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const updateLocation = async () => {
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    };
    const interval = setInterval(updateLocation, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.length > 0) {
      const filtered = eventsData.flatMap(event => event.events).filter(event => event.title.toLowerCase().includes(text.toLowerCase()));
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionPress = (event) => {
    setSearchQuery(event.title);
    setSuggestions([]);
    setRegion({
      latitude: event.latitude,
      longitude: event.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
    setEventDetails(event);
    setModalVisible(true);
  };

  // Navigatie naar EventDetailScreen
  const navigateToEventDetails = () => {
    if (eventDetails) {
      navigation.navigate('EventDetailScreen', { event: eventDetails });
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region}>
        {userLocation && (
          <Marker coordinate={userLocation}>
            <Image source={require('../assets/Car.png')} style={styles.carIcon} />
          </Marker>
        )}

        {eventsData.flatMap(item => item.events).map((event, index) => (
          <Marker key={index} coordinate={{ latitude: event.latitude, longitude: event.longitude }} onPress={() => handleSuggestionPress(event)}>
            <Image source={require('../assets/pin-icon3.png')} style={styles.pinIcon} />
          </Marker>
        ))}
      </MapView>

      <View style={styles.searchBar}>
        <TextInput style={styles.searchInput} placeholder="Search for an event" value={searchQuery} onChangeText={handleSearch} />
        <Ionicons name="search" size={24} color="black" style={styles.searchIcon} />
      </View>

      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item, index) => index.toString()}
          style={styles.suggestionsList}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSuggestionPress(item)} style={styles.suggestionItem}>
              <Text>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {eventDetails && (
        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{eventDetails.title}</Text>
                <Text style={styles.modalLocation}>{eventDetails.location}</Text>
                <Text style={styles.modalDescription}>{eventDetails.description}</Text>
                {eventDetails.imageName && (
                  <Image source={{ uri: `https://raedar-backend.onrender.com${eventDetails.imageName}` }} style={styles.eventImage} />
                )}
                {/* Verander de Close knop naar "View Parking" en navigeer naar de EventDetailScreen */}
                <TouchableOpacity onPress={navigateToEventDetails} style={styles.viewParkingButton}>
                  <Text style={styles.viewParkingButtonText}>View Parking</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  searchBar: { position: 'absolute', top: 20, left: 20, right: 20, flexDirection: 'row', backgroundColor: 'white', padding: 10, borderRadius: 10 },
  searchInput: { flex: 1 },
  searchIcon: { marginLeft: 10 },
  suggestionsList: { position: 'absolute', top: 60, left: 20, right: 20, backgroundColor: 'white', borderRadius: 5, maxHeight: 150 },
  suggestionItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  carIcon: { width: 40, height: 20 },
  pinIcon: { width: 15, height: 25 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%', alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold' },
  modalDescription: { fontSize: 16, marginVertical: 10 },
  modalLocation: { fontSize: 14, color: 'gray' },
  eventImage: { width: 280, height: 200, marginTop: 15, borderRadius: 10 },
  viewParkingButton: { marginTop: 15, padding: 10, backgroundColor: '#001D3D', borderRadius: 5 },
  viewParkingButtonText: { color: 'white', fontSize: 16 },
});

export default HomeScreen;
