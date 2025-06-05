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

export function SignUpScreen({ navigation, setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !username || !phoneNumber || !password) {
      Alert.alert("Error", "Vul alle velden in.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://raedar-backend.onrender.com/api/users",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            username,
            phoneNumber,
            password,
            action: "register",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registratie mislukt.");
      }

      // Token opslaan
      await AsyncStorage.setItem("userToken", data.token);

      Alert.alert("Succes", "Account succesvol aangemaakt!");
      setIsLoggedIn(true);
      navigation.navigate("Main");
    } catch (error) {
      Alert.alert("Registratie mislukt", error.message);
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
      <Text style={styles.header}>Registreren</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Gebruikersnaam"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
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
        title={loading ? "Even wachten..." : "Registreren"}
        onPress={handleSignUp}
        disabled={loading}
      />

      <Text
        style={styles.signInText}
        onPress={() => navigation.navigate("Login")}
      >
        Heb je al een account? Log hier in.
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
  signInText: {
    marginTop: 15,
    color: "#007BFF",
  },
});

export default SignUpScreen;
