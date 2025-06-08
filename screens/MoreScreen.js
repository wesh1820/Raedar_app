import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const MoreScreen = ({ setIsLoggedIn }) => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) return;

        const response = await fetch(
          "https://raedar-backend.onrender.com/api/users",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Kon gebruikersgegevens niet ophalen.");
        }

        setUser(data);
      } catch (error) {
        console.error("❌ Fout bij ophalen user:", error);
        Alert.alert("Fout", "Kon gebruikersinformatie niet ophalen.");
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userId");
    setIsLoggedIn(false);
  };

  return (
    <View style={styles.container}>
      {/* Profile Header (Clickable) */}
      <TouchableOpacity
        style={styles.profileContainer}
        onPress={() => navigation.navigate("Account")}
      >
        <Image
          source={{
            uri:
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.username || "User"
              )}`,
          }}
          style={styles.profileImage}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>{user?.username || "Laden..."}</Text>
          <Text style={styles.profileLocation}>
            {user?.phoneNumber || "Geen telefoonnummer"}
          </Text>
        </View>
        <Icon name="settings" size={24} color="#001D3D" />
      </TouchableOpacity>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Premium")}
        >
          <Text style={styles.menuText}>
            <Text style={styles.orange}>Raedar</Text> Premium
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Vehicle")}
        >
          <Text style={styles.menuText}>My vehicles</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("AccessibilitySettings")}
        >
          <Text style={styles.menuText}>Accessibility</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Payment")}
        >
          <Text style={styles.menuText}>Payment</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Support")}
        >
          <Text style={styles.menuText}>Support</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutContainer} onPress={handleLogout}>
        <Icon name="log-out" size={22} color="#EB6534" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MoreScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  profileContainer: {
    flexDirection: "row",
    backgroundColor: "#F2F4F7",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#001D3D",
  },
  profileLocation: {
    color: "#4B5563",
    fontSize: 15,
    marginTop: 4,
  },
  menuContainer: {
    marginTop: 10,
  },
  menuItem: {
    paddingVertical: 18,
  },
  menuText: {
    fontSize: 18,
    color: "#001D3D",
    fontWeight: "bold",
  },
  orange: {
    color: "#EB6534",
    fontWeight: "bold",
  },
  logoutContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    bottom: 40,
    left: 20,
  },
  logoutText: {
    color: "#EB6534",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
