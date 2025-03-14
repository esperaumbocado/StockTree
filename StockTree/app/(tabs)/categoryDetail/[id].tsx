import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import CategoryCard from '@/components/CategoryCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function DetailsScreen() {
  const { id, categoryName } = useLocalSearchParams(); // Get the category ID and name from params
  const colorScheme = useColorScheme();
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiUrl, setApiUrl] = useState(''); // Define apiUrl state

  // Load the API URL from SecureStore
  const loadApiUrl = async () => {
    try {
      const storedUrl = await SecureStore.getItemAsync('API_URL');
      if (storedUrl) {
        setApiUrl(`${storedUrl}/api/part/category`);
      } else {
        console.error('API URL not found in SecureStore.');
      }
    } catch (error) {
      console.error('Error loading API URL:', error.message);
    }
  };

  // Fetch subcategories of the current category
  const fetchSubcategories = async () => {
    try {
      setLoading(true);

      if (!apiUrl) {
        console.error('API URL is not set.');
        return;
      }

      const params = new URLSearchParams({
        parent: id,
        cascade: false,
        ordering: 'name',
      });

      const apiEndpoint = `${apiUrl}/?${params.toString()}`;

      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: {
          Authorization: 'Token inv-969802229ef25a65ede9ab5248af5eb3be0b7d2f-20250227',
          Accept: 'application/json',
          Connection: 'keep-alive',
          Host: 'inventree.localhost',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const rawData = await response.text();
      let data;
      try {
        data = JSON.parse(rawData);
      } catch (e) {
        throw new Error('Error parsing JSON response: ' + e.message);
      }

      const fetchedSubcategories = data.map((item) => ({
        id: item.pk,
        name: item.name,
        description: item.description,
        partCount: item.part_count,
        icon: item.icon,
      }));

      setSubcategories(fetchedSubcategories);
    } catch (error) {
      console.error('Error fetching subcategories:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load API URL when the component mounts
  useEffect(() => {
    loadApiUrl();
  }, []);

  // Fetch subcategories when apiUrl or category ID changes
  useEffect(() => {
    if (apiUrl) {
      fetchSubcategories();
    }
  }, [apiUrl, id]);

  return (
    <ScrollView style={{ flex: 1 }}>
      <ThemedView style={[styles.headerContainer, { backgroundColor: colorScheme === 'dark' ? '#A1E8C5' : '#A1E8C5' }]}>
        <ThemedText type="title" style={[styles.headerText, { color: colorScheme === 'dark' ? '#fff' : '#1D3D47' }]}>
          {categoryName}
        </ThemedText>
      </ThemedView>

      {loading ? (
        <ActivityIndicator size="large" color="#A1E8C5" style={styles.loader} />
      ) : (
        <View style={styles.categoryContainer}>
          {subcategories.length > 0 ? (
            subcategories.map(({ id, name, description, partCount, icon }) => (
              <CategoryCard
                key={id}
                name={name}
                description={description}
                partCount={partCount}
                icon={icon}
                categoryId={id} // Pass the subcategory ID to the card
              />
            ))
          ) : (
            <ThemedText style={styles.noResults}>No subcategories found.</ThemedText>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
  },
  categoryContainer: {
    padding: 16,
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
});