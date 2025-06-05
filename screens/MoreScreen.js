import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const MoreScreen = ({ setIsLoggedIn }) => {
  const navigation = useNavigation();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationSound, setNotificationSound] = useState(true);
  const [notificationBadge, setNotificationBadge] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("nl");
  const [isPremium, setIsPremium] = useState(false);
  const [pendingCancellation, setPendingCancellation] = useState(false);
  const [loading, setLoading] = useState(false);

  const [openPreferences, setOpenPreferences] = useState(false);
  const [openPremium, setOpenPremium] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [
          notifications,
          sound,
          badge,
          dark,
          lang,
          premium,
          cancelPending,
        ] = await Promise.all([
          AsyncStorage.getItem("notificationsEnabled"),
          AsyncStorage.getItem("notificationSound"),
          AsyncStorage.getItem("notificationBadge"),
          AsyncStorage.getItem("darkMode"),
          AsyncStorage.getItem("language"),
          AsyncStorage.getItem("isPremium"),
          AsyncStorage.getItem("pendingCancellation"),
        ]);

        if (notifications !== null)
          setNotificationsEnabled(notifications === "true");
        if (sound !== null) setNotificationSound(sound === "true");
        if (badge !== null) setNotificationBadge(badge === "true");
        if (dark !== null) setDarkMode(dark === "true");
        if (lang !== null) setLanguage(lang);
        if (premium !== null) setIsPremium(premium === "true");
        if (cancelPending !== null)
          setPendingCancellation(cancelPending === "true");
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };

    loadSettings();
  }, []);

  const updateSetting = async (key, value, setter) => {
    setter(value);
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
    }
  };

  const togglePreferences = useCallback(
    () => setOpenPreferences((prev) => !prev),
    []
  );
  const togglePremium = useCallback(() => setOpenPremium((prev) => !prev), []);

  const toggleDarkMode = async (val) => {
    await updateSetting("darkMode", val, setDarkMode);
    Alert.alert(
      "Opmerking",
      "Donkere modus zal toegepast worden na opnieuw starten."
    );
  };

  const toggleLanguage = async () => {
    const newLang = language === "nl" ? "en" : "nl";
    await updateSetting("language", newLang, setLanguage);
    Alert.alert(
      "Language Changed",
      `Taal gewijzigd naar ${newLang === "nl" ? "Nederlands" : "English"}.`
    );
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      setIsLoggedIn(false);
    } catch (error) {
      Alert.alert("Fout", "Uitloggen mislukt, probeer het opnieuw.");
    }
  };

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <View style={styles.content}>
        <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
          Settings
        </Text>

        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate("Account")}
          accessibilityRole="button"
          accessibilityLabel="Bekijk accountgegevens"
        >
          <Text style={[styles.label, darkMode && styles.textDark]}>
            Bekijk Accountgegevens
          </Text>
        </TouchableOpacity>

        {/* Accordion: Voorkeuren */}
        <TouchableOpacity
          style={styles.row}
          onPress={togglePreferences}
          accessibilityRole="button"
          accessibilityLabel={`Voorkeuren sectie ${
            openPreferences ? "open" : "gesloten"
          }`}
        >
          <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
            Voorkeuren {openPreferences ? "▲" : "▼"}
          </Text>
        </TouchableOpacity>

        {openPreferences && (
          <>
            <View style={styles.row}>
              <Text style={[styles.label, darkMode && styles.textDark]}>
                Notificaties aan
              </Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={(val) =>
                  updateSetting(
                    "notificationsEnabled",
                    val,
                    setNotificationsEnabled
                  )
                }
              />
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, darkMode && styles.textDark]}>
                Notificatie geluid
              </Text>
              <Switch
                value={notificationSound}
                onValueChange={(val) =>
                  updateSetting("notificationSound", val, setNotificationSound)
                }
              />
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, darkMode && styles.textDark]}>
                Notificatie badge
              </Text>
              <Switch
                value={notificationBadge}
                onValueChange={(val) =>
                  updateSetting("notificationBadge", val, setNotificationBadge)
                }
              />
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, darkMode && styles.textDark]}>
                Donkere modus
              </Text>
              <Switch value={darkMode} onValueChange={toggleDarkMode} />
            </View>

            <TouchableOpacity
              style={styles.row}
              onPress={toggleLanguage}
              accessibilityRole="button"
              accessibilityLabel="Taal wijzigen"
            >
              <Text style={[styles.label, darkMode && styles.textDark]}>
                Taal: {language === "nl" ? "Nederlands" : "English"}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Accordion: Premium */}
        <TouchableOpacity
          style={styles.row}
          onPress={togglePremium}
          accessibilityRole="button"
          accessibilityLabel={`Premium sectie ${
            openPremium ? "open" : "gesloten"
          }`}
        >
          <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
            Premium {openPremium ? "▲" : "▼"}
          </Text>
        </TouchableOpacity>

        {openPremium && (
          <>
            {loading && (
              <ActivityIndicator
                size="small"
                color={darkMode ? "#fff" : "#000"}
              />
            )}

            <TouchableOpacity
              style={[styles.row, isPremium ? styles.premiumRow : null]}
              onPress={() => navigation.navigate("Premium")}
              accessibilityRole="button"
              accessibilityLabel={isPremium ? "Beheer Premium" : "Koop Premium"}
            >
              <Text
                style={[styles.label, isPremium ? styles.premiumLabel : null]}
              >
                {isPremium ? "Beheer Premium" : "Koop Premium"}
              </Text>
            </TouchableOpacity>

            {isPremium && pendingCancellation && (
              <View style={[styles.row, styles.pendingCancelRow]}>
                <Text style={[styles.label, styles.pendingCancelLabel]}>
                  Premium opgezegd - loopt nog tot einde van de maand
                </Text>
              </View>
            )}
          </>
        )}

        <View style={{ marginTop: 30, alignItems: "center" }}>
          <Text style={[styles.versionText, darkMode && styles.textDark]}>
            Versie 1.0.0
          </Text>
        </View>
      </View>

      {/* Uitlogknop iets boven onderkant met marge */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Uitloggen"
        >
          <Text style={styles.logoutText}>Uitloggen</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MoreScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  containerDark: {
    backgroundColor: "#1B263B",
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#1B263B",
  },
  textDark: {
    color: "#F0F4F8",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    color: "#1B263B",
  },
  premiumRow: {
    backgroundColor: "#dff0d8",
  },
  premiumLabel: {
    color: "green",
    fontWeight: "bold",
  },
  pendingCancelRow: {
    backgroundColor: "#fff3cd",
  },
  pendingCancelLabel: {
    color: "#856404",
    fontWeight: "bold",
  },
  versionText: {
    color: "#5D6A77",
  },
  logoutContainer: {
    paddingVertical: 15,
    paddingBottom: 30, // ruimte onder de knop
    borderTopWidth: 1,
    borderTopColor: "#eee",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  logoutButton: {
    // Optioneel: extra styling voor knop, nu alleen touchable area
  },
  logoutText: {
    fontSize: 16,
    color: "red",
    fontWeight: "bold",
  },
});
