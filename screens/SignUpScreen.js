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

export function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://raedar-backend.onrender.com/api/users",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, action: "register" }),
        }
      );

      const text = await response.text(); // Get raw response text
      try {
        const data = JSON.parse(text); // Try parsing as JSON
        if (!response.ok)
          throw new Error(data.message || "Registratie mislukt.");

        await AsyncStorage.setItem("userToken", data.token);
        Alert.alert("Succes", "Account aangemaakt!");
        navigation.navigate("Walkthrough"); // Navigate to the walktrough screen after successful sign up
      } catch (jsonError) {
        throw new Error("Ongeldige API-respons: " + text);
      }
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
      <Text style={styles.header}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
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
        title={loading ? "Even wachten..." : "Sign Up"}
        onPress={handleSignUp}
        disabled={loading}
      />
      <Text
        style={styles.loginText}
        onPress={() => navigation.navigate("Login")} // Changed "LoginScreen" to "Login"
      >
        Al een account? Log in
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
  loginText: {
    marginTop: 15,
    color: "#007BFF",
  },
});

export default SignUpScreen;
