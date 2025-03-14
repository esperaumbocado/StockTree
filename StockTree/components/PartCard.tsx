import React from "react";
import { View, Text, StyleSheet, Image} from "react-native";
import { Card } from "react-native-paper";
import ImageCard from './ImageCard';

const PartCard = ({ name, stock, image}) => {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.details}>In stock: {stock}</Text>
        <ImageCard
            imageLink = {image}
            token = "inv-d3705ca8173ca063004eb382caed18a7c169ebd2-20250305"
        />

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