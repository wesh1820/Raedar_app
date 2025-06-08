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
import * as ImageManipulator from "expo-image-manipulator";
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
      if (!token) {
        Alert.alert("Error", "You are not logged in");
        return;
      }

      try {
        const res = await fetch(
          "https://raedar-backend.onrender.com/api/users",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          const text = await res.text();
          Alert.alert("Error", "Failed to fetch profile: " + text);
          return;
        }

        const data = await res.json();
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setStreet(data.street || "");
        setCity(data.city || "");
        setEmail(data.email || "");
        setPhone(data.phoneNumber || "");
        setAvatar(data.avatar || null);
      } catch (error) {
        Alert.alert("Error", "Something went wrong while fetching profile");
      }
    })();
  }, []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return Alert.alert(
        "Permission required",
        "Please allow access to photos"
      );
    }

    const result = await ImagePicker.launchImageLibraryAsync({ base64: false });

    if (!result.canceled && result.assets.length > 0) {
      const image = result.assets[0];

      // Resize & compress image
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        image.uri,
        [{ resize: { width: 400 } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      const base64 = `data:image/jpeg;base64,${manipulatedImage.base64}`;
      const token = await AsyncStorage.getItem("userToken");

      try {
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

        const text = await res.text();
        console.log("⬅️ Avatar upload response:", text);

        if (res.ok) {
          const data = JSON.parse(text);
          setAvatar(data.avatar);
        } else {
          Alert.alert("Error", `Uploading failed: ${text}`);
        }
      } catch (error) {
        console.error("❌ Upload error:", error);
        Alert.alert("Error", "Uploading failed");
      }
    }
  };

  const handleSave = async () => {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      Alert.alert("Error", "You are not logged in");
      return;
    }

    try {
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

      const text = await res.text();

      if (res.ok) {
        const data = JSON.parse(text);
        Alert.alert("Success", data.message || "Saved successfully");
      } else {
        Alert.alert("Error", `Save failed: ${text}`);
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong while saving profile");
    }
  };

  const changePassword = async () => {
    if (!newPassword) return Alert.alert("Error", "Enter a new password");

    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      Alert.alert("Error", "You are not logged in");
      return;
    }

    try {
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
        Alert.alert("Success", "Password changed");
        setNewPassword("");
        setShowPasswordInput(false);
      } else {
        Alert.alert("Error", data.error || "Failed");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong while changing password");
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

      <Text style={styles.sectionTitle}>Profile Details</Text>
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
        autoCapitalize="none"
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
            placeholder="New password"
            secureTextEntry
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.saveButton} onPress={changePassword}>
            <Text style={styles.saveText}>Change Password</Text>
          </TouchableOpacity>
        </View>
      )}

      {!showPasswordInput && (
        <TouchableOpacity onPress={() => setShowPasswordInput(true)}>
          <Text style={styles.changePassword}>Change Password</Text>
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
    marginBottom: 60,
  },
  sectionTitle: {
    alignSelf: "flex-start",
    fontSize: 18,
    fontWeight: "bold",
    color: "#001D3D",
    marginBottom: 20,
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
