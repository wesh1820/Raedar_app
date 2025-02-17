import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TextInput, Button, TouchableOpacity } from 'react-native';

const SettingsScreen = () => {
  // State for visibility settings
  const [isVisible, setIsVisible] = useState(true);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');

  // Toggle functions
  const toggleVisibility = () => setIsVisible(previousState => !previousState);
  const toggleNotifications = () => setIsNotificationsEnabled(previousState => !previousState);

  return (
    <View style={styles.container}>

      {/* Account Section */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.sectionHeader} onPress={() => setEmail(email ? '' : email)}>
          <Text style={styles.sectionTitle}>Account</Text>
        </TouchableOpacity>
        {email && (
          <View style={styles.sectionContent}>
            <Text style={styles.settingLabel}>Change Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter new email"
              value={email}
              onChangeText={setEmail}
            />
            <Button title="Save Email" onPress={() => console.log('Email saved:', email)} />
          </View>
        )}
      </View>
      {/* Visibility Section */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.sectionHeader} onPress={() => setIsVisible(!isVisible)}>
          <Text style={styles.sectionTitle}>Visibility</Text>
        </TouchableOpacity>
        {isVisible && (
          <View style={styles.sectionContent}>
            <Text style={styles.settingLabel}>Show my profile</Text>
            <Switch value={isVisible} onValueChange={toggleVisibility} />
          </View>
        )}
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.sectionHeader} onPress={() => setIsNotificationsEnabled(!isNotificationsEnabled)}>
          <Text style={styles.sectionTitle}>Notifications</Text>
        </TouchableOpacity>
        {isNotificationsEnabled && (
          <View style={styles.sectionContent}>
            <Text style={styles.settingLabel}>Enable Notifications</Text>
            <Switch value={isNotificationsEnabled} onValueChange={toggleNotifications} />
          </View>
        )}
      </View>

      {/* Payments Section */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.sectionHeader} onPress={() => setCardNumber(cardNumber ? '' : cardNumber)}>
          <Text style={styles.sectionTitle}>Payments</Text>
        </TouchableOpacity>
        {cardNumber && (
          <View style={styles.sectionContent}>
            <Text style={styles.settingLabel}>Add Payment Method</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Card Number"
              value={cardNumber}
              onChangeText={setCardNumber}
            />
            <Button title="Save Card" onPress={() => console.log('Card saved:', cardNumber)} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 3, // Adds shadow for Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.5,
  },
  sectionHeader: {
    padding: 15,
    backgroundColor: '#001D3D',
    borderRadius: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff'
  },
  sectionContent: {
    padding: 10,
    backgroundColor: '#fafafa',
    borderRadius: 5,
    marginTop: 10,
  },
  settingLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    width: '80%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 10,
  },
});

export default SettingsScreen;
