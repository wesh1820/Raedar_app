import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogBox } from "react-native";

import HomeScreen from "./screens/HomeScreen";
import EventScreen from "./screens/EventScreen";
import TicketScreen from "./screens/TicketScreen";
import MoreScreen from "./screens/MoreScreen";
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import EventDetailScreen from "./screens/EventDetailScreen";
import ParkingDetailScreen from "./screens/ParkingDetailScreen";
import TicketDetailScreen from "./screens/TicketDetailScreen";
import CategoryEventScreen from "./screens/CategoryEventScreen";

import {
  MaterialIcons,
  Ionicons,
  FontAwesome,
} from "react-native-vector-icons";

// Ignore specific warnings (optional)
LogBox.ignoreLogs(["Warning: ..."]);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("userToken");
      setIsLoggedIn(!!token); // Set to true if token exists
    };
    checkLoginStatus();
  }, []);

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <MainStack setIsLoggedIn={setIsLoggedIn} />
      ) : (
        <AuthStack setIsLoggedIn={setIsLoggedIn} />
      )}
    </NavigationContainer>
  );
}

// ✅ AuthStack: Login + Signup
function AuthStack({ setIsLoggedIn }) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        options={{ headerShown: false }} // Hide header (no back button)
      >
        {(props) => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Stack.Screen>
      <Stack.Screen
        name="SignUp"
        options={{ headerShown: false }} // Hide header (no back button)
      >
        {(props) => <SignUpScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// ✅ MainStack: The rest of the app
function MainStack({ setIsLoggedIn }) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Back"
        component={MainTabs}
        options={{ headerShown: false }} // Hide header for main tab screen
      />
      <Stack.Screen
        name="EventDetailScreen"
        component={EventDetailScreen}
        options={{ headerShown: true }} // Show back button
      />
      <Stack.Screen
        name="CategoryEvent"
        component={CategoryEventScreen}
        options={{ headerShown: true }} // Show back button
      />
      <Stack.Screen
        name="ParkingDetail"
        component={ParkingDetailScreen}
        options={{ headerShown: true }} // Show back button
      />
      <Stack.Screen
        name="TicketDetail"
        component={TicketDetailScreen}
        options={{ headerShown: true }} // Show back button
      />
      <Stack.Screen
        name="MoreScreen"
        component={MoreScreen}
        options={{ headerShown: true }} // Show back button
      />
    </Stack.Navigator>
  );
}

// ✅ TabNavigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: "#fff" },
        tabBarActiveTintColor: "#001D3D",
        tabBarInactiveTintColor: "#888",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Events"
        component={EventScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="event" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Tickets"
        component={TicketScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="ticket" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ellipsis-horizontal" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
