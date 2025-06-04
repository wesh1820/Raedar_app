import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

const SCREEN_WIDTH = Dimensions.get("window").width;
const COLUMN_GAP = 19;
const TILE_WIDTH = (SCREEN_WIDTH - COLUMN_GAP * 3) / 2;

// Haversine afstand berekenen
function getDistance(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper om datum dd-mm-jjjj naar Date object te parsen
function parseDate(dateStr) {
  // dateStr in format "15-09-2025"
  const [day, month, year] = dateStr.split("-");
  return new Date(year, month - 1, day);
}

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

  const [filteredEvents, setFilteredEvents] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          console.error("❌ User not authenticated");
          setLoading(false);
          return;
        }

        let userLat = null;
        let userLon = null;

        // Location ophalen als distance filter aanstaat
        if (filters.distance) {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            console.warn("Toegang tot locatie geweigerd");
          } else {
            const location = await Location.getCurrentPositionAsync({});
            userLat = location.coords.latitude;
            userLon = location.coords.longitude;
          }
        }

        const response = await axios.get(
          "https://raedar-backend.onrender.com/api/events",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        let categories = response.data;
        let allEvents = categories.flatMap((cat) =>
          Array.isArray(cat.events) ? cat.events : []
        );

        // Filter favorite
        if (filters.favorite) {
          allEvents = allEvents.filter((event) => {
            const fav =
              typeof event.favorite === "object"
                ? parseInt(event.favorite.$numberInt)
                : event.favorite;
            return fav === 1;
          });
        }

        // Filter date: alleen events vandaag of later + sorteren op datum
        if (filters.date) {
          allEvents = allEvents
            .filter((event) => {
              const eventDate = parseDate(event.date);
              const now = new Date();
              now.setHours(0, 0, 0, 0);
              return eventDate >= now;
            })
            .sort((a, b) => parseDate(a.date) - parseDate(b.date));
        }

        // Filter popular
        if (filters.popular) {
          allEvents = allEvents.filter((event) => {
            const val =
              typeof event.populair === "object"
                ? parseInt(event.populair.$numberInt)
                : event.populair;
            return val === 1;
          });
        }

        // Filter distance: voeg afstand toe en sorteer
        if (filters.distance && userLat !== null && userLon !== null) {
          allEvents = allEvents
            .filter((event) => event && event.latitude && event.longitude)
            .map((event) => {
              const lat =
                typeof event.latitude === "object"
                  ? parseFloat(event.latitude.$numberDouble)
                  : parseFloat(event.latitude);

              const lon =
                typeof event.longitude === "object"
                  ? parseFloat(event.longitude.$numberDouble)
                  : parseFloat(event.longitude);

              const dist = getDistance(userLat, userLon, lat, lon);
              return { ...event, distance: dist };
            });

          allEvents.sort((a, b) => a.distance - b.distance);
        }

        // Als er geen event-filter actief is, toon categorieën in twee kolommen
        if (
          !filters.favorite &&
          !filters.date &&
          !filters.popular &&
          !filters.distance
        ) {
          setFilteredEvents([]);
          // Categorieën voorbereiden voor 2 kolommen
          const sortedCategories = categories.sort((a, b) =>
            a.category.localeCompare(b.category)
          );

          const left = [];
          const right = [];
          sortedCategories.forEach((item, index) => {
            // Hoogte afwisselen voor leukere layout
            const isEvenRow = Math.floor(index / 2) % 2 === 0;
            const isLeft = index % 2 === 0;
            const heightFactor = isEvenRow
              ? isLeft
                ? 18
                : 22
              : isLeft
              ? 22
              : 18;

            const card = { ...item, height: heightFactor * 10 };

            if (isLeft) left.push(card);
            else right.push(card);
          });

          setLeftColumn(left);
          setRightColumn(right);
        } else {
          // Anders tonen we de gefilterde events
          setFilteredEvents(allEvents);
          setLeftColumn([]);
          setRightColumn([]);
        }
      } catch (error) {
        console.error("❌ Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [filters]);

  const openEvent = (event) => {
    const isFilterActive = Object.values(filters).some((v) => v === true);
    if (isFilterActive) {
      navigation.navigate("ParkingDetail", { event });
    } else {
      navigation.navigate("EventDetailScreen", { event });
    }
  };

  const openCategory = (category) => {
    navigation.navigate("CategoryEvent", {
      category: category.category,
      events: category.events,
    });
  };

  const toggleFilter = (filter) => {
    setFilters((prev) => {
      const isCurrentlyActive = prev[filter];

      // Als filter aan staat en je klikt er weer op -> alles uitzetten (geen filter)
      if (isCurrentlyActive) {
        return {
          popular: false,
          distance: false,
          date: false,
          favorite: false,
        };
      }

      // Anders zet alleen deze filter aan en zet de rest uit
      return {
        popular: false,
        distance: false,
        date: false,
        favorite: false,
        [filter]: true,
      };
    });
  };

  const renderCategoryColumn = (data) =>
    data.map((item) => {
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

  const renderEventList = (events) =>
    events.map((event, index) => {
      const imageUri = event.imageName
        ? `https://raedar-backend.onrender.com${event.imageName}`
        : "https://via.placeholder.com/150";

      return (
        <TouchableOpacity
          key={index}
          onPress={() => openEvent(event)}
          style={[styles.eventCard, { height: 150 }]}
        >
          <ImageBackground
            source={{ uri: imageUri }}
            style={styles.categoryButton}
            imageStyle={styles.categoryImage}
          >
            <View style={styles.overlay}>
              <Text style={styles.categoryTitle}>{event.title}</Text>
              <Text style={styles.eventDate}>{event.date}</Text>
              <Text style={styles.eventLocation}>
                {event.location}{" "}
                {event.distance ? `(${event.distance.toFixed(1)} km)` : ""}
              </Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      );
    });

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

      {filteredEvents.length > 0 ? (
        <View style={styles.eventListContainer}>
          {renderEventList(filteredEvents)}
        </View>
      ) : (
        <View style={styles.columnsContainer}>
          <View style={styles.column}>{renderCategoryColumn(leftColumn)}</View>
          <View style={styles.column}>{renderCategoryColumn(rightColumn)}</View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: COLUMN_GAP,
  },
  festivalImage: {
    width: "112%",
    height: 200,
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
    marginBottom: COLUMN_GAP,
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
    paddingHorizontal: 10,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  eventDate: {
    color: "#ddd",
    fontSize: 12,
    marginTop: 2,
  },
  eventLocation: {
    color: "#ccc",
    fontSize: 11,
  },
  eventListContainer: {
    gap: 15,
  },
  eventCard: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#ccc",
    marginBottom: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EventScreen;
