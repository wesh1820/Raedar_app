import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

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
    description:
      "Enjoy comfortable and spacious parking spaces for your vehicle.",
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
      setCurrentIndex((prev) => prev + 1);
    } else {
      await AsyncStorage.setItem("hasSeenWalkthrough", "true");
      setIsLoggedIn(true); // pas nu de MainStack in
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.logo}></Text>
        <Text style={styles.title}>{slides[currentIndex].title}</Text>
        <Text style={styles.description}>
          {slides[currentIndex].description}
        </Text>
      </View>

      <Image
        source={slides[currentIndex].image}
        style={styles.image}
        resizeMode="contain"
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentIndex === index && styles.activeDot]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: "space-between",
  },
  top: {
    marginBottom: 30,
  },
  logo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1B263B",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1B263B",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#1B263B",
    lineHeight: 22,
  },
  image: {
    width: "100%",
    height: 380,
    alignSelf: "center",
  },
  footer: {
    alignItems: "center",
  },
  dots: {
    flexDirection: "row",
    marginBottom: 20,
  },
  dot: {
    height: 8,
    width: 8,
    backgroundColor: "#FFD9D4",
    borderRadius: 4,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#EF476F",
    width: 20,
  },
  button: {
    backgroundColor: "#001D3D",
    paddingVertical: 14,
    paddingHorizontal: 90,
    borderRadius: 15,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
