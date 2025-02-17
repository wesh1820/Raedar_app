import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LogBox } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import EventScreen from './screens/EventScreen';
import TicketScreen from './screens/TicketScreen';
import MoreScreen from './screens/MoreScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import EventDetailScreen from './screens/EventDetailScreen'; // Import the EventDetailScreen
import ParkingDetailScreen from './screens/ParkingDetailScreen'; // Import the ParkingDetailScreen
import TicketDetailScreen from './screens/TicketDetailScreen'; // Import TicketDetailScreen
import CategoryEventScreen from './screens/CategoryEventScreen';

import { MaterialIcons, Ionicons, FontAwesome } from 'react-native-vector-icons';

LogBox.ignoreLogs(['Warning: ...']); // Ignore specific warnings

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen">
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="EventDetail" component={EventDetailScreen} />
        <Stack.Screen name="CategoryEvent" component={CategoryEventScreen} />
        <Stack.Screen name="ParkingDetail" component={ParkingDetailScreen} />
        <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: '#fff' }, // Customize tab bar style
        tabBarActiveTintColor: '#001D3D', // Active icon color
        tabBarInactiveTintColor: '#888', // Inactive icon color
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

export default App;
