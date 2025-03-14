import React from "react";
import { View, Text, StyleSheet, useColorScheme, Pressable} from "react-native";
import { Card } from "react-native-paper";

const PartCard = ({ name, stock, imageUrl}) => {
      const colorScheme = useColorScheme();

  return (
    <View style={styles.cardContainer}>
      <View style={[styles.card, {backgroundColor: colorScheme === 'dark' ? '#333' : '#fff', opacity: 1,},]}>
        <Text style={[styles.title, { color: colorScheme === 'dark' ? '#fff' : '#333' }]}>{name}</Text>
        <Text style={[styles.details , { color: colorScheme === 'dark' ? '#ddd' : '#333' }]}>In stock: {stock}</Text>

      </View>
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