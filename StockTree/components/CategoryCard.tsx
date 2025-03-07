import React from 'react';
import { View, Text, StyleSheet, Image, useColorScheme } from 'react-native';

const CategoryCard = ({ name, description, partCount, icon }) => {
  const colorScheme = useColorScheme();  // Get the current color scheme (light or dark)

  // Dynamic styles based on the color scheme
  const cardBackgroundColor = colorScheme === 'dark' ? '#333' : '#fff';
  const textColor = colorScheme === 'dark' ? '#fff' : '#333';
  const descriptionColor = colorScheme === 'dark' ? '#ccc' : '#777';
  const partCountColor = colorScheme === 'dark' ? '#ddd' : '#333';

  return (
    <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
      {icon && <Image source={{ uri: icon }} style={styles.icon} />}
      <Text style={[styles.name, { color: textColor }]}>{name}</Text>
      <Text style={[styles.description, { color: descriptionColor }]}>{description}</Text>
      <Text style={[styles.partCount, { color: partCountColor }]}>Parts: {partCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
  },
  partCount: {
    fontSize: 16,
  },
});

export default CategoryCard;
