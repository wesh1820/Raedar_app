// UserContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        // Doe hier fetch naar je API om user data op te halen
        // of haal user data direct uit AsyncStorage (afhankelijk van jouw setup)
        // Voorbeeld:
        const userData = await fetchUserData(token);
        setUser(userData);
      }
    };
    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

async function fetchUserData(token) {
  // Je fetch logica hier, return user object met premium bool
  // Voorbeeld:
  const response = await fetch(
    "https://raedar-backend.onrender.com/api/users/",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const data = await response.json();
  return data.user; // pas aan naar jouw API response structuur
}
