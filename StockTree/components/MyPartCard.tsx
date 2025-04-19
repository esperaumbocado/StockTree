import React from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import { Card } from "react-native-paper";
import ImageCard from './ImageCard';
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";

const MyPartCard = ({ name, stock, image }) => {
  const colorScheme = useColorScheme();

  return (
    <View style = {styles.cardContainer} >
      <View
        style={[
          styles.card,
          {
            backgroundColor: colorScheme === "dark" ? "#333" : "#fff",
          },
        ]}
      >
        <ImageCard imageLink={image} />
        <Text
          style={[
            styles.title,
            {
              color: colorScheme === "dark" ? "#fff" : "#333",
            },
          ]}
        >
          {name}
        </Text>
        <Text
          style={[
            styles.details,
            {
              color: colorScheme === "dark" ? "#ddd" : "#333",
            },
          ]}
        >
          In stock: {stock}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
cardContainer: {

  marginVertical: 0,
  marginBottom:0,
  borderBottomWidth: 2,
  borderBottomColor: "#ccc",
},

card: {
  padding: 16,
},

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },
  details: {
    fontSize: 16,
    marginBottom: 12,
  },
});

export { MyPartCard };
