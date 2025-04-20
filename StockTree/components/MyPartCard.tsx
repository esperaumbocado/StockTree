import React from "react";
import { View, Text, StyleSheet, useColorScheme, Pressable } from "react-native";
import { Card } from "react-native-paper";
import ImageCard from "./ImageCard";

const MyPartCard = ({
  name,
  stock,
  stockName,
  image,
  selectionMode = false,
  isSelected = false,
  onLongPress,
  onSelectToggle,
}) => {
  const colorScheme = useColorScheme();

  const backgroundColor = colorScheme === "dark" ? "#333" : "#fff";
  const textColor = colorScheme === "dark" ? "#fff" : "#333";
  const detailsColor = colorScheme === "dark" ? "#ddd" : "#333";
  const selectedHighlight = isSelected ? "#f44336" : backgroundColor;

  return (
    <Pressable
      onLongPress={onLongPress}
      onPress={selectionMode ? onSelectToggle : undefined}
      style={[styles.cardContainer, { backgroundColor: selectedHighlight }]}
    >
      <View style={[styles.card]}>
        <ImageCard imageLink={image} />
        <Text style={[styles.title, { color: textColor }]}>{name}</Text>
        <Text style={[styles.details, { color: detailsColor }]}>{stockName}</Text>
        <Text style={[styles.details, { color: detailsColor }]}>{stock} in stock </Text>
        {selectionMode && (
          <Text style={[styles.selectHint, { color: isSelected ? "#00796b" : "#888" }]}>
            {isSelected ? "✓ Selected" : "Tap to select"}
          </Text>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 0,
    marginBottom: 0,
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
    marginTop: 5,
    marginBottom: 1,
  },
  selectHint: {
    fontSize: 14,
    fontStyle: "italic",
  },
});

export { MyPartCard };
