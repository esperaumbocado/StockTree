import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "react-native-paper";

const LocationCard = ({ locationName, capacity, itemsStored }) => {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>{locationName}</Text>
        <Text style={styles.details}>Capacity: {capacity}</Text>
        <Text style={styles.details}>Items Stored: {itemsStored}</Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 10,
    padding: 10,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  details: {
    fontSize: 14,
    color: "gray",
  },
});

export default LocationCard;
