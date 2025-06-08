import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation, setIsLoggedIn }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);

  const handleLogin = async () => {
    if (!phoneNumber || !password) return;
    setLoading(true);
    try {
      const res = await fetch("https://raedar-backend.onrender.com/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, password, action: "login" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      await AsyncStorage.setItem("userToken", data.token);
      await AsyncStorage.setItem("userId", data.user._id);
      setIsLoggedIn(true);
    } catch (e) {
      alert(e.message);
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
        <Text style={styles.title}>Login</Text>

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

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <Text style={styles.signupPrompt}>
          Don’t have an account?{" "}
          <Text
            style={styles.signupLink}
            onPress={() => navigation.navigate("SignUp")}
          >
            Sign up
          </Text>
        </Text>
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
    paddingTop: 60,
    width: "100%",
    height: 350,
  },
  logo: {
    width: 300,
    height: 300,
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
  forgotPassword: { alignSelf: "flex-end", marginBottom: 30 },
  forgotPasswordText: {
    fontSize: 14,
    color: "#667085",
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#001D3D",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupPrompt: {
    marginTop: 20,
    fontSize: 15,
    color: "#667085",
    textAlign: "center",
  },
  signupLink: {
    color: "#001D3D",
    fontWeight: "600",
  },
});
