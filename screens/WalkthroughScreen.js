import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
} from "react-native";

const slides = [
  {
    key: "1",
    title: "Find Nearby Parking",
    description: "Easily find the nearby parking spot for events.",
    image: require("../assets/Walk1.png"), // Vervang met jouw eigen illustraties
  },
  {
    key: "2",
    title: "Book & Park",
    description: "Enjoy comfortable and spacious parking spaces for your vehicle.",
    image: require("../assets/Walk2.png"),
  },
  {
    key: "3",
    title: "Extend Time",
    description: "When your parking time is up, it's easy to add more time.",
    image: require("../assets/Walk3.png"),
  },
];

const { width } = Dimensions.get("window");
export default function WalkthroughScreen({ setIsLoggedIn }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      await AsyncStorage.setItem("userToken", "dummy_token");
      setIsLoggedIn(true); // activeert de MainStack in App.js
    }
  };
  

  return (
    <View style={styles.container}>
      <Image source={slides[currentIndex].image} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{slides[currentIndex].title}</Text>
      <Text style={styles.description}>{slides[currentIndex].description}</Text>

      <View style={styles.dots}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index && styles.activeDot,
            ]}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFEAE6",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  image: {
    width: width * 0.8,
    height: 300,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1B263B",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 30,
  },
  dots: {
    flexDirection: "row",
    marginBottom: 20,
  },
  dot: {
    height: 8,
    width: 8,
    backgroundColor: "#f5c6cb",
    borderRadius: 4,
    margin: 5,
  },
  activeDot: {
    backgroundColor: "#EF476F",
    width: 20,
  },
  button: {
    backgroundColor: "#1B263B",
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 30,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
