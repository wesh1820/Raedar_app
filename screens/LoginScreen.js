import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function LoginScreen({ navigation, setIsLoggedIn }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phoneNumber || !password) {
      Alert.alert("Error", "Vul zowel je telefoonnummer als wachtwoord in.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "https://raedar-backend.onrender.com/api/users",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber, password, action: "login" }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login mislukt.");
      }

      // Token opslaan voor toekomstige API-aanvragen
      await AsyncStorage.setItem("userToken", data.token);

      Alert.alert("Succes", "Je bent ingelogd!");
      setIsLoggedIn(true);
      navigation.navigate("Main"); // Navigate to Main
    } catch (error) {
      Alert.alert("Login mislukt", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/RaedarLogo.png")}
        style={styles.image}
      />
      <Text style={styles.header}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Telefoonnummer"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Wachtwoord"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title={loading ? "Even wachten..." : "Login"}
        onPress={handleLogin}
        disabled={loading}
      />

      <Text
        style={styles.signUpText}
        onPress={() => navigation.navigate("SignUp")} // Navigate to the SignUp screen
      >
        Nog geen account? Registreer hier.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  image: {
    width: 300,
    height: 66,
    marginBottom: 60,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 15,
  },
  signUpText: {
    marginTop: 15,
    color: "#007BFF",
  },
});

export default LoginScreen;
