import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ImageBackground,
  CheckBox,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSignUp = async () => {
    if (!email || !username || !phoneNumber || !password || !agreeTerms) {
      Alert.alert("Error", "Vul alle velden in en accepteer de voorwaarden.");
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
      if (!response.ok) throw new Error(data.error || "Registratie mislukt");

      await AsyncStorage.setItem("userToken", data.token);
      await AsyncStorage.setItem("hasSeenWalkthrough", "false");

      Alert.alert("Succes", "Account succesvol aangemaakt!");
      navigation.navigate("Walkthrough");
    } catch (error) {
      Alert.alert("Fout", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/wall.png")}
        style={styles.topContainer}
        resizeMode="cover"
      >
        <Image
          source={require("../assets/RaedarLogo2.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </ImageBackground>

      <View style={styles.bottomContainer}>
        <Text style={styles.title}>Register</Text>

        {/* E-mail */}
        <View style={styles.inputWrapper}>
          <Icon name="at" size={20} color="#667085" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="example@raedar.be"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>

        {/* Username */}
        <View style={styles.inputWrapper}>
          <Icon name="user" size={20} color="#667085" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="words"
          />
        </View>

        {/* Phone */}
        <View style={styles.inputWrapper}>
          <Icon name="phone" size={20} color="#667085" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="+32 412 34 56 78"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>

        {/* Password */}
        <View style={styles.inputWrapper}>
          <Icon name="lock" size={20} color="#667085" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={secureText}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setSecureText(!secureText)}>
            <Icon
              name={secureText ? "eye-slash" : "eye"}
              size={20}
              color="#667085"
            />
          </TouchableOpacity>
        </View>

        {/* Checkbox */}
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            onPress={() => setAgreeTerms(!agreeTerms)}
            style={styles.checkboxBox}
          >
            <View
              style={[
                styles.checkbox,
                agreeTerms && { backgroundColor: "#001D3D" },
              ]}
            />
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>Terms & Agreements</Text>
        </View>

        {/* Navigatie en button */}
        <Text
          style={styles.loginText}
          onPress={() => navigation.navigate("Login")}
        >
          I have an account already
        </Text>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#001D3D" },
  topContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    width: "100%",
    height: 350,
  },
  logo: {
    width: 300,
    height: 60,
    bottom: 20,
  },
  bottomContainer: {
    flex: 2,
    backgroundColor: "#F9FAFB",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#001D3D",
    marginBottom: 20,
    textAlign: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 16,
  },
  icon: { marginRight: 8 },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#001D3D",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  checkboxBox: {
    marginRight: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#001D3D",
  },
  checkboxLabel: {
    fontSize: 15,
    color: "#001D3D",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#667085",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginText: {
    marginBottom: 20,
    textAlign: "center",
    color: "#001D3D",
    fontWeight: "500",
  },
});
