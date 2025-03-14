import React from "react";
import { View, Text, StyleSheet, Image, useColorScheme } from "react-native";
import { Card } from "react-native-paper";

const LocationCard = ({ locationName, capacity, itemsStored, icon }) => {
  const colorScheme = useColorScheme();  // Get the current theme (light or dark)

  // Dynamic styles based on the current theme
  const styles = getStyles(colorScheme);

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Image source={{ uri: icon }} style={styles.icon} />
          <Text style={styles.title}>{locationName}</Text>
        </View>
        <Text style={styles.details}>Capacity: {capacity}</Text>
        <Text style={styles.details}>Items Stored: {itemsStored}</Text>
      </Card.Content>
    </Card>
  );
};

// Get dynamic styles based on the theme
const getStyles = (theme: string) => {
  return StyleSheet.create({
    card: {
      margin: 10,
      padding: 10,
      borderRadius: 10,
      elevation: 3,
      backgroundColor: theme === 'dark' ? '#333' : '#fff',  // Dark background in dark mode
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    icon: {
      width: 40,
      height: 40,
      marginRight: 10,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme === 'dark' ? '#fff' : '#000',  // Light text in dark mode
    },
    details: {
      fontSize: 14,
      color: theme === 'dark' ? '#ccc' : 'gray',  // Lighter gray text in dark mode
    },
  });
};

export default LocationCard;
