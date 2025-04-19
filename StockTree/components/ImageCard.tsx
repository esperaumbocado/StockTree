import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Card } from "react-native-paper";

const ImageCard = ({ imageLink }) => {
  return (
    <Card style={styles.card}>
      {imageLink ? (
        <Image
          source={{
            uri: imageLink,
            headers: {
              Authorization: `Token inv-8424bedbeceb27da942439fff71390388e87f3fe-20250321`,
            },
          }}
          style={styles.image}
        />
      ) : (
        <View style={styles.noImageContainer}>
          <Text style={styles.noImageText}>No image available</Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "transparent", // Matches background, removes visible border
    elevation: 0, // Removes Android shadow
    shadowColor: "transparent", // Removes iOS shadow
  },

  image: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
  },
  noImageContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  noImageText: {
    color: "gray",
    fontSize: 14,
  },
});

export default ImageCard;
