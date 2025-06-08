import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import IntroScreen from "./screens/IntroScreen";
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import WalkthroughScreen from "./screens/WalkthroughScreen";
import HomeScreen from "./screens/HomeScreen";
import { EventScreen } from "./screens/EventScreen";
import TicketScreen from "./screens/TicketScreen";
import MoreScreen from "./screens/MoreScreen";
import EventDetailScreen from "./screens/EventDetailScreen";
import ParkingDetailScreen from "./screens/ParkingDetailScreen";
import TicketDetailScreen from "./screens/TicketDetailScreen";
import CategoryEventScreen from "./screens/CategoryEventScreen";
import AccountScreen from "./screens/AccountScreen";
import OrderScreen from "./screens/OrderScreen";
import PaymentScreen from "./screens/PaymentScreen";
import SupportScreen from "./screens/SupportScreen";
import PremiumScreen from "./screens/PremiumScreen";
import AccessibilitySettingsScreen from "./screens/AccessibilitySettingsScreen";
import CardDetailScreen from "./screens/CardDetailScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  MaterialIcons,
  Ionicons,
  FontAwesome,
} from "react-native-vector-icons";
import VehiclesScreen from "./screens/VehicleScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true); // Show intro on cold app start
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function initialize() {
      try {
        // No AsyncStorage flag for intro; always show intro on app cold start

        const token = await AsyncStorage.getItem("userToken");
        setIsLoggedIn(!!token);

        if (token) {
          const userData = await AsyncStorage.getItem("userData");
          if (userData) setUser(JSON.parse(userData));
        }
      } catch (e) {
        console.warn("Initialization error", e);
      }
      setLoading(false);
    }
    initialize();
  }, []);

  if (loading) return null;

  // IMPORTANT: No navigation.navigate('AuthStack') or navigation.replace('AuthStack')!

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showIntro ? (
          <Stack.Screen name="Intro">
            {(props) => (
              <IntroScreen
                {...props}
                onFinish={() => setShowIntro(false)}
                showIntro={showIntro}
                isLoggedIn={isLoggedIn}
              />
            )}
          </Stack.Screen>
        ) : isLoggedIn ? (
          <Stack.Screen name="MainStack">
            {(props) => (
              <MainStack {...props} setIsLoggedIn={setIsLoggedIn} user={user} />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="AuthStack">
            {(props) => <AuthStack {...props} setIsLoggedIn={setIsLoggedIn} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function AuthStack({ setIsLoggedIn }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login">
        {(props) => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Stack.Screen>
      <Stack.Screen name="SignUp">
        {(props) => <SignUpScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Stack.Screen>
      <Stack.Screen name="Walkthrough">
        {(props) => (
          <WalkthroughScreen {...props} setIsLoggedIn={setIsLoggedIn} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function MainStack({ setIsLoggedIn, user }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs">
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
        name="OrderScreen"
        component={OrderScreen}
        options={{ headerShown: true, title: "Order" }}
      />
      <Stack.Screen
        name="Premium"
        component={PremiumScreen}
        options={{ headerShown: true, title: "Premium" }}
      />
      <Stack.Screen
        name="Vehicle"
        component={VehiclesScreen}
        options={{ headerShown: true, title: "Vehicle" }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ headerShown: true, title: "Payment" }}
      />
      <Stack.Screen
        name="CardDetail"
        component={CardDetailScreen}
        options={{ headerShown: true, title: "CardDetail" }}
      />
      <Stack.Screen
        name="AccessibilitySettings"
        component={AccessibilitySettingsScreen}
        options={{ headerShown: true, title: "AccessibilitySettings" }}
      />
      <Stack.Screen
        name="Support"
        component={SupportScreen}
        options={{ headerShown: true, title: "Support" }}
      />
    </Stack.Navigator>
  );
}

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
