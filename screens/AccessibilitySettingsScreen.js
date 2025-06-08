import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AccessibilitySettingsScreen() {
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [voiceOver, setVoiceOver] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const lt = await AsyncStorage.getItem("access_largeText");
        const hc = await AsyncStorage.getItem("access_highContrast");
        const vo = await AsyncStorage.getItem("access_voiceOver");
        if (lt !== null) setLargeText(lt === "true");
        if (hc !== null) setHighContrast(hc === "true");
        if (vo !== null) setVoiceOver(vo === "true");
      } catch (e) {
        Alert.alert("Error", "Could not load accessibility settings.");
      }
    };
    loadSettings();
  }, []);

  const toggleLargeText = async (value) => {
    setLargeText(value);
    await AsyncStorage.setItem("access_largeText", value.toString());
  };

  const toggleHighContrast = async (value) => {
    setHighContrast(value);
    await AsyncStorage.setItem("access_highContrast", value.toString());
  };

  const toggleVoiceOver = async (value) => {
    setVoiceOver(value);
    await AsyncStorage.setItem("access_voiceOver", value.toString());
  };

  const resetSettings = async () => {
    setLargeText(false);
    setHighContrast(false);
    setVoiceOver(false);
    await AsyncStorage.multiRemove([
      "access_largeText",
      "access_highContrast",
      "access_voiceOver",
    ]);
    Alert.alert("Reset", "All accessibility settings have been reset.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accessibility Settings</Text>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Larger Text</Text>
        <Switch
          value={largeText}
          onValueChange={toggleLargeText}
          thumbColor={largeText ? "#EB6534" : "#001D3D"}
          trackColor={{ false: "#767577", true: "#FFB88C" }}
          accessibilityLabel="Toggle larger text"
        />
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>High Contrast Theme</Text>
        <Switch
          value={highContrast}
          onValueChange={toggleHighContrast}
          thumbColor={highContrast ? "#EB6534" : "#001D3D"}
          trackColor={{ false: "#767577", true: "#FFB88C" }}
          accessibilityLabel="Toggle high contrast theme"
        />
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>VoiceOver Feedback</Text>
        <Switch
          value={voiceOver}
          onValueChange={toggleVoiceOver}
          thumbColor={voiceOver ? "#EB6534" : "#001D3D"}
          trackColor={{ false: "#001D3D", true: "#FFB88C" }}
          accessibilityLabel="Toggle voice feedback"
        />
      </View>

      <TouchableOpacity
        style={styles.resetButton}
        onPress={resetSettings}
        accessibilityLabel="Reset all accessibility settings"
      >
        <Text style={styles.resetButtonText}>Reset Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#EB6534",
    marginBottom: 30,
    textAlign: "center",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#001D3D",
  },
  resetButton: {
    marginTop: 40,
    backgroundColor: "#001D3D",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  resetButtonText: {
    color: "white",
    fontWeight: "800",
    fontSize: 18,
  },
});
