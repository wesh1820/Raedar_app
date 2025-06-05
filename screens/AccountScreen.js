import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  Button,
  TextInput,
  Alert,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AccountScreen = () => {
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [tel, setTel] = useState("");
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const userToken = await AsyncStorage.getItem("userToken");
      if (!userToken) return;

      try {
        const response = await fetch(
          "https://raedar-backend.onrender.com/api/users",
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();

        setUserEmail(data.email || "");
        setUserName(data.username || "");
        setCreatedAt(data.createdAt || "");
        setAvatar(data.avatar || null);
        setTel(data.phoneNumber || "");
        setIsPremium(data.premium || false);
      } catch (err) {
        console.log("Fout bij ophalen van gebruikersgegevens:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Geen toegang",
          "Toestemming voor toegang tot foto's is nodig om een profielfoto te kiezen."
        );
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5,
        base64: true,
      });

      if (pickerResult.cancelled) return;

      if (!pickerResult.base64) {
        Alert.alert("Fout", "Kon geen afbeelding in base64 formaat ophalen.");
        return;
      }

      const userToken = await AsyncStorage.getItem("userToken");
      if (!userToken) {
        Alert.alert("Fout", "Je bent niet ingelogd.");
        return;
      }

      const base64Avatar = `data:image/jpeg;base64,${pickerResult.base64}`;

      const response = await fetch(
        "https://raedar-backend.onrender.com/api/users/avatar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ avatar: base64Avatar }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setAvatar(result.avatar);
        Alert.alert("Succes", "Profielfoto succesvol gewijzigd!");
      } else {
        Alert.alert(
          "Fout",
          result.error || "Profielfoto uploaden is mislukt, probeer opnieuw."
        );
      }
    } catch (error) {
      console.error("Fout bij uploaden profielfoto:", error);
      Alert.alert(
        "Fout",
        "Er is een onverwachte fout opgetreden bij het uploaden van de profielfoto."
      );
    }
  };

  const changePassword = async () => {
    if (!newPassword) {
      Alert.alert("Fout", "Vul een nieuw wachtwoord in.");
      return;
    }

    const userToken = await AsyncStorage.getItem("userToken");
    if (!userToken) {
      Alert.alert("Fout", "Je bent niet ingelogd.");
      return;
    }

    try {
      const response = await fetch(
        "https://raedar-backend.onrender.com/api/users/password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ password: newPassword }),
        }
      );

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        Alert.alert("Fout", "Server gaf geen geldige JSON terug.");
        return;
      }

      if (response.ok) {
        Alert.alert("Succes", "Wachtwoord succesvol gewijzigd.");
        setShowPasswordInput(false);
        setNewPassword("");
      } else {
        Alert.alert("Fout", result.error || "Er ging iets mis.");
      }
    } catch (err) {
      Alert.alert(
        "Fout",
        "Er is een fout opgetreden tijdens het wijzigen van het wachtwoord."
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#001D3D" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.avatarContainer}>
        <Image
          source={{
            uri: avatar
              ? avatar
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  userName
                )}`,
          }}
          style={styles.avatar}
        />
        <Button title="Wijzig profielfoto" onPress={pickImage} />
        <Text style={styles.name}>{userName}</Text>
        <Text style={styles.email}>{userEmail}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Naam</Text>
        <Text style={styles.value}>{userName}</Text>

        <Text style={styles.label}>E-mail</Text>
        <Text style={styles.value}>{userEmail}</Text>

        <Text style={styles.label}>Telefoonnummer</Text>
        <Text style={styles.value}>{tel || "Niet ingevuld"}</Text>

        <Text style={styles.label}>Premium status</Text>
        <Text style={styles.value}>{isPremium ? "Ja" : "Nee"}</Text>

        <Text style={styles.label}>Account aangemaakt op</Text>
        <Text style={styles.value}>
          {createdAt
            ? new Date(createdAt).toLocaleDateString("nl-NL")
            : "Onbekend"}
        </Text>
      </View>

      {showPasswordInput && (
        <View style={styles.card}>
          <Text style={styles.label}>Nieuw wachtwoord</Text>
          <TextInput
            secureTextEntry
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Nieuw wachtwoord"
          />
          <Button title="Bevestig wijziging" onPress={changePassword} />
        </View>
      )}

      {!showPasswordInput && (
        <TouchableOpacity onPress={() => setShowPasswordInput(true)}>
          <Text style={styles.changePassword}>Wachtwoord wijzigen</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    backgroundColor: "#F5F7FA",
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: "600",
    color: "#001D3D",
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontWeight: "600",
    marginBottom: 5,
    color: "#001D3D",
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  changePassword: {
    color: "#007BFF",
    textAlign: "center",
    fontWeight: "600",
  },
});

export default AccountScreen;
