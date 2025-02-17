import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

export function HomeScreen() {
  const [region, setRegion] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Request location permission and fetch the current location
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  // Handle search functionality
  const handleSearch = async () => {
    // Implement search functionality (for now, you can use static coordinates)
    if (searchQuery === 'London') {
      setRegion({
        latitude: 51.5074,
        longitude: -0.1278,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } else {
      setErrorMsg('Location not found');
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={false} // Hide the default blue dot
        followsUserLocation={false} // Disable following the user
      >
        {/* Custom Marker with orange car image */}
        {region && (
          <Marker coordinate={region}>
            <Image
              source={require('../assets/Car.png')} // Replace with your car icon image
              style={styles.carIcon}
            />
          </Marker>
        )}

        {/* Search Bar inside the map */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a location"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </MapView>

      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  searchBar: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    borderColor: '#001D3D',
    borderWidth: 0.2,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    elevation: 5,  // Optional: Adds shadow for iOS
    zIndex: 1, // Ensures the search bar stays on top of the map
  },
  searchInput: {
    flex: 1,
    borderRadius: 20,
    paddingLeft: 10,
  },
  searchButton: {
    backgroundColor: '#001D3D',
    borderRadius: 20,
    padding: 10,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carIcon: {
    width: 40,  // Adjust the width of the car icon
    height: 20, // Adjust the height of the car icon
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 10,
  },
});

export default HomeScreen;
