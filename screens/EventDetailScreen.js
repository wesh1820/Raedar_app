import React from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const EventDetailScreen = ({ route, navigation }) => {
  const { event } = route.params; // Access the event data passed from EventScreen

  const imageUri = event.imageName
    ? `https://raedar-backend.onrender.com${event.imageName}`
    : null;

  const handleParkingPress = (parking) => {
    // Navigate to the ParkingDetailScreen with the parking data
    navigation.navigate("ParkingDetail", { parking });
  };

  return (
    <View style={styles.detailContainer}>
      {imageUri && (
        <ImageBackground
          source={{ uri: imageUri }}
          style={styles.eventImageDetail}
          imageStyle={styles.eventImageStyle}
        >
          <View style={styles.overlay}>
            <Text style={styles.eventTitle}>{event.title || "No Title"}</Text>
          </View>
        </ImageBackground>
      )}

      {/* Event details */}
      <View style={styles.textContainer}>
        <Text style={styles.eventDescription}>
          {event.description || "No Description"}
        </Text>
        <Text style={styles.eventDate}>
          📅 {event.date || "No Date Available"}
        </Text>
        <Text style={styles.eventLocation}>
          📍 {event.location || "No Location Available"}
        </Text>

        {/* Parkings List */}
        <View style={styles.parkingsContainer}>
          <Text style={styles.parkingsTitle}>Available Parkings:</Text>
          {event.parkings && event.parkings.length > 0 ? (
            event.parkings.map((parking, index) => (
              <TouchableOpacity
                key={index}
                style={styles.parkingItem}
                onPress={() => handleParkingPress(parking)}
              >
                <Text style={styles.parkingText}>{parking.location}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text>No parking information available</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  detailContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  eventImageDetail: {
    width: "100%",
    height: 300,
    justifyContent: "flex-end",
    alignItems: "center",
    borderRadius: 1,
  },
  eventImageStyle: {
    borderRadius: 8,
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: "100%",
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  textContainer: {
    padding: 20,
  },
  eventDescription: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  eventDate: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 5,
  },
  eventLocation: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 15,
  },
  parkingsContainer: {
    marginTop: 20,
  },
  parkingsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  parkingItem: {
    padding: 10,
    backgroundColor: "#EB6534",
    borderRadius: 15,
    marginBottom: 8,
  },
  parkingText: {
    fontSize: 16,
    color: "#ffffff",
  },
});

export default EventDetailScreen;
