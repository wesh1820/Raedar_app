import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // of 'react-native-vector-icons'

const CategoryEventScreen = ({ route }) => {
  const { category, events } = route.params;
  const navigation = useNavigation();

  const renderEvent = ({ item }) => {
    const imageUri = item.imageName
      ? `https://raedar-backend.onrender.com${item.imageName}`
      : null;

    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() =>
          navigation.navigate("EventDetailScreen", { event: item })
        }
      >
        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.eventImage} />
        )}
        <View style={styles.overlay}>
          <Text style={styles.eventTitle}>{item.title || "No Title"}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Eigen header met afbeelding bovenop */}
      <View style={styles.headerContainer}>
        <Image
          source={require("../assets/festival.png")}
          style={styles.headerImage}
        />
        {/* Eigen back-button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={30} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerText}>{category}</Text>
      </View>

      {/* Evenementenlijst */}
      <FlatList
        data={events}
        keyExtractor={(item) => `${item._id}-${item.title}`}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={renderEvent}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: Platform.OS === "android" ? -StatusBar.currentHeight : 0,
  },
  headerContainer: {
    position: "relative",
    width: "100%",
    height: 220,
    marginBottom: 20,
  },
  headerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "android" ? 40 : 60,
    left: 20,
    padding: 5,
    zIndex: 2,
  },
  headerText: {
    position: "absolute",
    bottom: 20,
    left: 20,
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  eventCard: {
    flexDirection: "column",
    borderRadius: 15,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
    width: "48%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  eventImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 0,
    padding: 15,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    width: "100%",
    height: 50,
    justifyContent: "center",
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default CategoryEventScreen;
