import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Card } from "react-native-paper";

const ImageCard = ({ imageLink, token }) => {
  return (
    <Card style={styles.card}>
      <Card.Content>
        {imageLink ? (
          <Image
            source={{
              uri: imageLink,
              headers: {
                Authorization: `Token inv-58ee10118c2d54e3fdf307b5da82430a9de96205-20250321`,
              },
            }}
            style={styles.image}
          />
        ) : (
          <Text style={styles.noImage}>No image available</Text>
        )}
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
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  noImage: {
    fontSize: 14,
    color: "gray",
    marginTop: 10,
  },
});

export default ImageCard;
