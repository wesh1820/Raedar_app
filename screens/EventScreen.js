import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground, // <-- deze toevoegen
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SCREEN_WIDTH = Dimensions.get("window").width;
const COLUMN_GAP = 19;
const TILE_WIDTH = (SCREEN_WIDTH - COLUMN_GAP * 3) / 2;

export function EventScreen() {
  const [leftColumn, setLeftColumn] = useState([]);
  const [rightColumn, setRightColumn] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    popular: false,
    distance: false,
    date: false,
    favorite: false,
  });
  const navigation = useNavigation();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");

        if (!token) {
          console.error("❌ User not authenticated");
          return;
        }

        const response = await axios.get(
          "https://raedar-backend.onrender.com/api/events",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        let sorted = response.data.sort((a, b) =>
          a.category.localeCompare(b.category)
        );

        // Filter de evenementen op basis van de gekozen filters
        if (filters.popular) {
          sorted = sorted.filter((event) => event.populair === 1);
        }

        if (filters.favorite) {
          sorted = sorted.filter((event) => event.favorite === 1); // Filter voor favoriete evenementen
        }

        if (filters.date) {
          sorted = sorted.filter((event) => new Date(event.date) >= new Date()); // Filter voor evenementen vanaf de huidige datum
        }

        if (filters.distance) {
          // Stel een logica voor afstand in, bijvoorbeeld evenementen binnen een bepaalde straal
          sorted = sorted.filter((event) => event.distance <= 50); // Stel hier je afstandslogica in
        }

        // Verdeel de items handmatig over 2 kolommen met hoogte-alternatie
        const left = [];
        const right = [];

        sorted.forEach((item, index) => {
          const isEvenRow = Math.floor(index / 2) % 2 === 0;
          const isLeft = index % 2 === 0;

          const heightFactor = isEvenRow
            ? isLeft
              ? 18
              : 22
            : isLeft
            ? 22
            : 18;

          const card = {
            ...item,
            height: heightFactor * 10,
          };

          if (isLeft) left.push(card);
          else right.push(card);
        });

        setLeftColumn(left);
        setRightColumn(right);
      } catch (error) {
        console.error("❌ Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [filters]); // We triggeren een herlaad wanneer de filters veranderen

  const openCategory = (category) => {
    navigation.navigate("CategoryEvent", {
      category: category.category,
      events: category.events,
    });
  };

  const renderColumn = (data) => {
    return data.map((item) => {
      const imageUri = item.categoryImage
        ? `https://raedar-backend.onrender.com${item.categoryImage}`
        : "https://via.placeholder.com/150";

      return (
        <TouchableOpacity
          key={item._id}
          onPress={() => openCategory(item)}
          style={[styles.categoryCard, { height: item.height }]}
        >
          <ImageBackground
            source={{ uri: imageUri }}
            style={styles.categoryButton}
            imageStyle={styles.categoryImage}
          >
            <View style={styles.overlay}>
              <Text style={styles.categoryTitle}>{item.category}</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      );
    });
  };

  const toggleFilter = (filter) => {
    setFilters((prev) => ({
      ...prev,
      [filter]: !prev[filter],
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading events...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Add Image above the filters */}
      <Image
        source={require("../assets/festival.png")}
        style={styles.festivalImage}
      />

      <View style={styles.filterContainer}>
        <TouchableOpacity
          onPress={() => toggleFilter("popular")}
          style={styles.filterButton}
        >
          <Text style={styles.filterText}>
            {filters.popular ? "All" : "Popular"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => toggleFilter("favorite")}
          style={styles.filterButton}
        >
          <Text style={styles.filterText}>
            {filters.favorite ? "All" : "Favorites"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => toggleFilter("date")}
          style={styles.filterButton}
        >
          <Text style={styles.filterText}>{filters.date ? "All" : "Date"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => toggleFilter("distance")}
          style={styles.filterButton}
        >
          <Text style={styles.filterText}>
            {filters.distance ? "All" : "Distance"}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.columnsContainer}>
        <View style={styles.column}>{renderColumn(leftColumn)}</View>
        <View style={styles.column}>{renderColumn(rightColumn)}</View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: COLUMN_GAP,
  },
  festivalImage: {
    width: "112%",
    height: 200, // Adjust the height as per your requirement
    marginBottom: COLUMN_GAP,
    marginTop: -20,
    marginLeft: -19,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: COLUMN_GAP,
  },
  filterButton: {
    backgroundColor: "#EB6534",
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderRadius: 25,
  },
  filterText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  columnsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    width: TILE_WIDTH,
    gap: COLUMN_GAP,
  },
  categoryCard: {
    width: TILE_WIDTH,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#ccc",
  },
  categoryButton: {
    flex: 1,
    justifyContent: "flex-end",
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    backgroundColor: "rgba(61, 61, 61, 0.5)",
    paddingVertical: 8,
    alignItems: "left",
    paddingHorizontal: 10,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EventScreen;
