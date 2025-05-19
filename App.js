import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogBox } from "react-native";

// Import screens
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
import WalkthroughScreen from "./screens/WalkthroughScreen";



// Import icons
import {
  MaterialIcons,
  Ionicons,
  FontAwesome,
} from "react-native-vector-icons";

// Ignore specific warnings
LogBox.ignoreLogs(["Warning: ..."]);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("userToken");
      setIsLoggedIn(!!token);
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

// 🔐 Auth stack: Login + Signup
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
  {(props) => <WalkthroughScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
</Stack.Screen>

    </Stack.Navigator>
  );
}

// 🔄 Main stack (post-login)
function MainStack({ setIsLoggedIn }) {
  return (
    <Stack.Navigator>
  
      <Stack.Screen name="Main" options={{ headerShown: false }}>
        {(props) => <MainTabs {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Stack.Screen>
      <Stack.Screen
        name="EventDetailScreen"
        component={EventDetailScreen}
        options={{
          headerShown: true,
          title: "",
          headerStyle: { backgroundColor: "" },
          headerTintColor: "#000000",
          headerBackTitleVisible: false,
        }}
      />
      
      <Stack.Screen
        name="CategoryEvent"
        component={CategoryEventScreen}
        options={{
          headerShown: true,
          title: "",
          headerStyle: { backgroundColor: "" },
          headerTintColor: "#000000",
          headerBackTitleVisible: false, // Verwijder de terugknop
        }}
      />
      <Stack.Screen
        name="ParkingDetail"
        component={ParkingDetailScreen}
        options={{
          headerShown: true,
          title: "",
          headerStyle: { backgroundColor: "" },
          headerTintColor: "#000000",
          headerBackTitleVisible: false, // Verwijder de terugknop
        }}
      />
      <Stack.Screen
        name="TicketDetail"
        component={TicketDetailScreen}
        options={{
          headerShown: true,
          title: "",
          headerStyle: { backgroundColor: "" },
          headerTintColor: "#000000",
          headerBackTitleVisible: false, // Verwijder de terugknop
        }}
      />
    </Stack.Navigator>
  );
}

// 🧭 Bottom tabs
function MainTabs({ setIsLoggedIn }) {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: "#fff" },
        tabBarActiveTintColor: "#001D3D",
        tabBarInactiveTintColor: "#888",
        headerShown: false, // Geen header op de tabs
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
