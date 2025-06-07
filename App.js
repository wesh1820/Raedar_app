import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogBox } from "react-native";

// Screens
import HomeScreen from "./screens/HomeScreen";
import EventScreen from "./screens/EventScreen";
import TicketScreen from "./screens/TicketScreen";
import MoreScreen from "./screens/MoreScreen";
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import WalkthroughScreen from "./screens/WalkthroughScreen";
import EventDetailScreen from "./screens/EventDetailScreen";
import ParkingDetailScreen from "./screens/ParkingDetailScreen";
import TicketDetailScreen from "./screens/TicketDetailScreen";
import CategoryEventScreen from "./screens/CategoryEventScreen";
import AccountScreen from "./screens/AccountScreen";
import PaymentScreen from "./screens/PaymentScreen";

// Icons
import {
  MaterialIcons,
  Ionicons,
  FontAwesome,
} from "react-native-vector-icons";
import PremiumScreen from "./screens/PremiumScreen";

LogBox.ignoreLogs(["Warning: ..."]);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        setIsLoggedIn(true);
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
      setLoading(false); // klaar met checken
    };
    checkLoginStatus();
  }, []);

  if (loading) {
    // Optioneel: hier kan je een splashscreen tonen of gewoon null returnen
    return null;
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <MainStack setIsLoggedIn={setIsLoggedIn} user={user} />
      ) : (
        <AuthStack setIsLoggedIn={setIsLoggedIn} />
      )}
    </NavigationContainer>
  );
}

// Auth stack for login/signup
function AuthStack({ setIsLoggedIn }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" options={{ headerShown: false }}>
        {(props) => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Stack.Screen>
      <Stack.Screen name="SignUp" options={{ headerShown: false }}>
        {(props) => <SignUpScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Stack.Screen>
      <Stack.Screen name="Walkthrough" options={{ headerShown: false }}>
        {(props) => (
          <WalkthroughScreen {...props} setIsLoggedIn={setIsLoggedIn} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// Main stack after login
function MainStack({ setIsLoggedIn, user }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" options={{ headerShown: false }}>
        {(props) => (
          <MainTabs {...props} setIsLoggedIn={setIsLoggedIn} user={user} />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="EventDetailScreen"
        component={EventDetailScreen}
        options={{
          headerShown: true,
          title: "",
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="CategoryEvent"
        options={{
          headerShown: true,
          title: "",
          headerBackTitleVisible: false,
        }}
      >
        {(props) => <CategoryEventScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen
        name="ParkingDetail"
        component={ParkingDetailScreen}
        options={{
          headerShown: true,
          title: "",
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="TicketDetail"
        component={TicketDetailScreen}
        options={{
          headerShown: true,
          title: "",
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="Account"
        component={AccountScreen}
        options={{ headerShown: true, title: "Account" }}
      />
      <Stack.Screen
        name="PaymentScreen"
        component={PaymentScreen}
        options={{ headerShown: true, title: "Payment" }}
      />
      <Stack.Screen
        name="Premium"
        component={PremiumScreen}
        options={{ headerShown: true, title: "Premium" }}
      />
    </Stack.Navigator>
  );
}

// Bottom tab navigation
function MainTabs({ setIsLoggedIn, user }) {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: "#fff" },
        tabBarActiveTintColor: "#001D3D",
        tabBarInactiveTintColor: "#888",
        headerShown: false,
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
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ellipsis-horizontal" size={size} color={color} />
          ),
        }}
      >
        {(props) => <MoreScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
