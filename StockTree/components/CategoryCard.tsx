import React from 'react';
import { View, Text, StyleSheet, Image, useColorScheme, Pressable } from 'react-native';
import { Link } from 'expo-router';

const CategoryCard = ({ name, description, partCount, icon, categoryId }) => {
  const colorScheme = useColorScheme();
  console.log('CategoryCard info:', {
    name,
    description,
    partCount,
    icon,
    categoryId,
  });

  return (
    <View style={styles.cardContainer}>
      <Link
        href={{
          pathname: `/categoryDetail/${categoryId}`,
          params: { categoryName: name }, // Pass the category name as a parameter
        }}
        asChild
      >
        <Pressable>
          {({ pressed }) => (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colorScheme === 'dark' ? '#333' : '#fff',
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
                {name &&  partCount != null ? (
                  <>
                    {/*{icon && <Image source={{ uri: icon }} style={styles.icon} />}*/}
                    <Text style={[styles.name, { color: colorScheme === 'dark' ? '#fff' : '#333' }]}>{name}</Text>
                    <Text style={[styles.description, { color: colorScheme === 'dark' ? '#ccc' : '#777' }]}>{description ? description : 'No description available'}</Text>
                    <Text style={[styles.partCount, { color: colorScheme === 'dark' ? '#ddd' : '#333' }]}>Parts: {partCount}</Text>
                  </>
                ) : (
                  <Text style={{ color: 'red', fontSize: 16 }}>
                    Category data incomplete.
                  </Text>
                )}

            </View>
          )}
        </Pressable>
      </Link>
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