import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AccountScreen = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const res = await fetch("https://raedar-backend.onrender.com/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setStreet(data.street || "");
        setCity(data.city || "");
        setEmail(data.email || "");
        setPhone(data.phoneNumber || "");
        setAvatar(data.avatar || null);
      }
    })();
  }, []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return Alert.alert("Toestemming vereist", "Geef toegang tot foto's.");
    }
    const result = await ImagePicker.launchImageLibraryAsync({ base64: true });
    if (!result.canceled && result.assets.length > 0) {
      const image = result.assets[0];
      const base64 = `data:image/jpeg;base64,${image.base64}`;
      const token = await AsyncStorage.getItem("userToken");
      const res = await fetch(
        "https://raedar-backend.onrender.com/api/users/avatar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ avatar: base64 }),
        }
      );
      const data = await res.json();
      if (res.ok) setAvatar(data.avatar);
      else Alert.alert("Fout", data.error || "Uploaden mislukt.");
    }
  };

  const handleSave = async () => {
    const token = await AsyncStorage.getItem("userToken");
    const res = await fetch(
      "https://raedar-backend.onrender.com/api/users/update",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          street,
          city,
          email,
          phoneNumber: phone,
        }),
      }
    );
    const data = await res.json();
    if (res.ok) Alert.alert("Succes", "Profiel opgeslagen");
    else Alert.alert("Fout", data.error || "Opslaan mislukt");
  };

  const changePassword = async () => {
    if (!newPassword) return Alert.alert("Fout", "Wachtwoord invullen");
    const token = await AsyncStorage.getItem("userToken");
    const res = await fetch(
      "https://raedar-backend.onrender.com/api/users/password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: newPassword }),
      }
    );
    const data = await res.json();
    if (res.ok) {
      Alert.alert("Succes", "Wachtwoord gewijzigd");
      setNewPassword("");
      setShowPasswordInput(false);
    } else {
      Alert.alert("Fout", data.error || "Mislukt");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={avatar ? { uri: avatar } : require("../assets/profile.png")}
          style={styles.avatar}
        />
      </TouchableOpacity>
      <Text style={styles.title}>Edit Profile</Text>
      <Text style={styles.sectionTitle}>Profile Detail</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.inputHalf}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First Name"
        />
        <TextInput
          style={styles.inputHalf}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last Name"
        />
      </View>
      <View style={styles.row}>
        <TextInput
          style={styles.inputHalf}
          value={street}
          onChangeText={setStreet}
          placeholder="Street"
        />
        <TextInput
          style={styles.inputHalf}
          value={city}
          onChangeText={setCity}
          placeholder="City"
        />
      </View>
      <TextInput
        style={styles.inputFull}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.inputFull}
        value={phone}
        onChangeText={setPhone}
        placeholder="Phone Number"
        keyboardType="phone-pad"
      />

      {showPasswordInput && (
        <View style={{ width: "100%" }}>
          <TextInput
            style={styles.inputFull}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Nieuw wachtwoord"
            secureTextEntry
          />
          <TouchableOpacity style={styles.saveButton} onPress={changePassword}>
            <Text style={styles.saveText}>Wachtwoord wijzigen</Text>
          </TouchableOpacity>
        </View>
      )}

      {!showPasswordInput && (
        <TouchableOpacity onPress={() => setShowPasswordInput(true)}>
          <Text style={styles.changePassword}>Wachtwoord wijzigen</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#001D3D",
    marginBottom: 20,
  },
  sectionTitle: {
    alignSelf: "flex-start",
    fontSize: 18,
    fontWeight: "bold",
    color: "#001D3D",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  inputHalf: {
    width: "48%",
    backgroundColor: "#F1F5F9",
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    color: "#1B263B",
  },
  inputFull: {
    width: "100%",
    backgroundColor: "#F1F5F9",
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    color: "#1B263B",
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: "#001D3D",
    paddingVertical: 18,
    width: "100%",
    borderRadius: 14,
    marginTop: 20,
  },
  saveText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  changePassword: {
    color: "#007BFF",
    textAlign: "center",
    fontWeight: "600",
    marginTop: 10,
  },
});

export default AccountScreen;
