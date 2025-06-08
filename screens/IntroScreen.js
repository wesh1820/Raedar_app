import React, { useRef } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Video } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function IntroScreen({ onFinish }) {
  const video = useRef(null);

  const onPlaybackStatusUpdate = async (status) => {
    if (status.didJustFinish) {
      await AsyncStorage.setItem("introScreen", "true");

      const userId = await AsyncStorage.getItem("userId");
      const loggedIn = userId && userId !== "false" && userId.trim() !== "";

      onFinish(loggedIn);
    }
  };

  return (
    <View style={styles.container}>
      <Video
        ref={video}
        source={require("../assets/intro.mp4")}
        style={styles.video}
        resizeMode="cover"
        shouldPlay
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        useNativeControls={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  video: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
