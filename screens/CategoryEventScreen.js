import React from 'react';
import { View, Text, FlatList, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CategoryEventScreen = ({ route }) => {
  const { category, events } = route.params;
  const navigation = useNavigation();

  const renderEvent = ({ item }) => {
    const imageUri = item.imageName ? `https://raedar-backend.onrender.com${item.imageName}` : null;

    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => navigation.navigate('EventDetail', { event: item })} // ✅ Ga naar EventDetailScreen
      >
        {imageUri && (
          <ImageBackground
            source={{ uri: imageUri }}
            style={styles.eventImage}
            imageStyle={styles.eventImageStyle}
          >
            <View style={styles.overlay}>
              <Text style={styles.eventTitle}>{item.title || 'No Title'}</Text>
            </View>
          </ImageBackground>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{category}</Text>
      <FlatList
        data={events}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={renderEvent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    backgroundColor: '#001D3D',
    color: '#fff',
    padding: 15,
    borderRadius: 15,

  },
  eventCard: {
    flexDirection: 'row',
    borderRadius: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  eventImageStyle: {
    borderRadius: 8,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    width: '100%',
    height: 50,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default CategoryEventScreen;
