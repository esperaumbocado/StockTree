import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Card } from "react-native-paper";

const LocationCard = ({ locationName, capacity, itemsStored, icon }) => {
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

const styles = StyleSheet.create({
  card: {
    margin: 10,
    padding: 10,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: "#fff",
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
  },
  details: {
    fontSize: 14,
    color: "gray",
  },
});

export default LocationCard;