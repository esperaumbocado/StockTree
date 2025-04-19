import React from "react";
import { View, Text, StyleSheet, useColorScheme, Pressable, Alert} from "react-native";
import { Card } from "react-native-paper";
import ImageCard from './ImageCard';
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";

const PartCard = ({name, stock, image, partId}) => {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const SELECTED_PARTS_KEY = "selected_parts";
  // HANDLE ADDING PART
  const handleAddPart = async () => {
    try {
      const stored = await AsyncStorage.getItem(SELECTED_PARTS_KEY);
      const now = Date.now();

      let current = stored ? JSON.parse(stored) : [];

      // Remove expired
      //current = current.filter(item => now - item.timestamp < 86400000);

      const alreadyAdded = current.some(item => item.partId === partId);
      if (alreadyAdded) {
        Alert.alert("Already added", "This part is already selected.");
        return;
      }

      current.push({
        partId,
        timestamp: now,
      });
      console.log("Selected Parts (about to be saved):", current);
      await AsyncStorage.setItem(SELECTED_PARTS_KEY, JSON.stringify(current));
      Alert.alert("Success", "Part added to selected parts");
    } catch (err) {
      console.error("Add failed:", err);
      Alert.alert("Error", "Could not add part.");
    }
  };

  // GO TO DETAILS PAGE
  const navigateToDetails = () => {
    router.push({
      pathname: `/partDetail/${partId}`,
      params: { partName: name },
    });
  };

  return (
    <View style={styles.cardContainer}>
      <Pressable onPress={navigateToDetails} style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colorScheme === 'dark' ? '#333' : '#fff',
          opacity: pressed ? 0.9 : 1,
        },
      ]}>
        <Text style={[styles.title, { color: colorScheme === 'dark' ? '#fff' : '#333' }]}>{name}</Text>
        <Text style={[styles.details, { color: colorScheme === 'dark' ? '#ddd' : '#333' }]}>In stock: {stock}</Text>
        <ImageCard imageLink={image} />

        {/* Add button lives *inside* card but isn't wrapped by outer pressable */}
        <Pressable onPress={handleAddPart} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({


  cardContainer: {
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  card: {
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  details: {
    fontSize: 16,
  },
  addButton: {
    marginTop: 12,
    backgroundColor: '#1D3557',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  image: {
      width: 100,
      height: 100,
      marginTop: 10,
      borderRadius: 8,
    },
    noImage: {
      fontSize: 14,
      color: "#black",
      marginTop: 5,
    },
});

export { PartCard };