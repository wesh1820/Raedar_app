import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';

export function EventScreen() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          console.error('❌ User not authenticated');
          return;
        }

        const idToken = await user.getIdToken();

        const response = await axios.get('https://raedar-backend.onrender.com/api/events', {
          headers: { Authorization: `Bearer ${idToken}` },
        });

        const sortedCategories = response.data.sort((a, b) =>
          a.category.localeCompare(b.category)
        );
        setCategories(sortedCategories);
      } catch (error) {
        console.error('❌ Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <Text>Loading events...</Text>;
  }

  const openCategory = (category) => {
    navigation.navigate('CategoryEvent', { category: category.category, events: category.events });
  };

  const renderCategory = ({ item }) => {
    const imageUri = item.categoryImage ? `https://raedar-backend.onrender.com${item.categoryImage}` : null;
  
    return (
      <TouchableOpacity onPress={() => openCategory(item)} style={styles.categoryCard}>
        <ImageBackground
          source={{ uri: imageUri }}
          style={styles.categoryButton}
          imageStyle={styles.categoryImage}
        >
          <View style={styles.overlay}>
            <Text style={styles.categoryTitle}>{item.category}</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };
  

  return (
    <FlatList
      data={categories}
      keyExtractor={(item) => item._id}
      renderItem={renderCategory}
      ListEmptyComponent={<Text>No events found</Text>}
    />
  );
}

const styles = StyleSheet.create({
  categoryCard: {
    marginBottom: 10,
  },
  categoryButton: {
    width: '90%',
    alignSelf: 'center',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    height: 150,
    overflow: 'hidden',
  },
  categoryImage: {
    borderRadius: 25,
    width: '110%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 10,
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default EventScreen;
