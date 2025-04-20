import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CategoryCard from '@/components/CategoryCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PartCard } from '@/components/PartCard'; // Import PartCard component

export default function DetailsScreen() {
  const { id, categoryName } = useLocalSearchParams(); // Get the category ID and name from params
  const colorScheme = useColorScheme();
  const [subcategories, setSubcategories] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiUrl, setApiUrl] = useState(''); // Define apiUrl state

  // Load the API URL from SecureStore or AsyncStorage depending on the platform
  const loadApiUrl = async () => {
    try {
      let storedUrl;
      if (Platform.OS === 'web') {
        storedUrl = await AsyncStorage.getItem('API_URL');
      } else {
        storedUrl = await SecureStore.getItemAsync('API_URL');
      }

      if (storedUrl) {
        setApiUrl(`${storedUrl}`);
      } else {
        console.error('API URL not found in storage.');
      }
    } catch (error) {
      console.error('Error loading API URL:', error.message);
    }
  };

  const fetchParts = async () => {
    try {
      setLoading(true);
      await loadApiUrl();
      if (!apiUrl) return;

      const params = new URLSearchParams({
        category: id,
      });

      console.log('Request Params (Parts): ', params.toString());

      const apiEndpoint = `${apiUrl}/api/part/?${params.toString()}`;
      console.log('API ENDPOINT (Parts): ', apiEndpoint);
      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: {
          Authorization: 'Token inv-14194edbbb32e2d6074ecd7b0ccf4dba4c754bc6-20250228',
          Accept: 'application/json',
          Connection: 'keep-alive',
          Host: 'inventree.localhost',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status (Parts): ${response.status}`);
      }

      const rawData = await response.text();
      console.log('Raw Response (Parts):', rawData);

      let data;
      try {
        data = JSON.parse(rawData);
      } catch (e) {
        throw new Error('Error parsing JSON response (Parts): ' + e.message);
      }

      console.log("Parsed Data (Parts): ", data);

      let fetchedParts;
      if (Array.isArray(data)) {
        fetchedParts = data.map((item) => {
          const imageUrl = item.image ? `${apiUrl}${item.image}` : null;
          return {
            id: item.pk,
            name: item.name,
            description: item.description,
            image: imageUrl,
            stock: item.in_stock,
          };
        });
      } else {
        const imageUrl = data.image ? `${apiUrl}${data.image}` : null;
        fetchedParts = [
          {
            id: data.pk,
            name: data.name,
            description: data.description,
            image: imageUrl,
            stock: data.in_stock,
          },
        ];
      }

      setParts(fetchedParts);
    } catch (error) {
      console.error('Error fetching parts:', error.message);
    } finally {
      setLoading(false);
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

      console.log('API URL:', apiUrl);

      const params = new URLSearchParams({
        parent: id,
        cascade: true,
        ordering: 'name',
        depth: 1,
      });

      console.log('Request Params:', params.toString());

      const apiEndpoint = `${apiUrl}/api/part/category/?${params.toString()}`;

      console.log('Request Headers:', {
        Authorization: 'Token inv-14194edbbb32e2d6074ecd7b0ccf4dba4c754bc6-20250228',
        Accept: 'application/json',
        Connection: 'keep-alive',
        Host: 'inventree.localhost',
      });

      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: {
          Authorization: 'Token inv-14194edbbb32e2d6074ecd7b0ccf4dba4c754bc6-20250228',
          Accept: 'application/json',
          Connection: 'keep-alive',
          Host: 'inventree.localhost',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const rawData = await response.text();
      console.log('Raw Response:', rawData); // Log the raw response

      let data;
      try {
        data = JSON.parse(rawData);
      } catch (e) {
        throw new Error('Error parsing JSON response: ' + e.message);
      }

      console.log('Parsed Data:', data); // Log the parsed data

      // Handle both array and object responses
      let fetchedSubcategories;
      if (Array.isArray(data)) {
        // If the response is an array, map it directly
        fetchedSubcategories = data.map((item) => ({
          id: item.pk,
          name: item.name,
          description: item.description,
          partCount: item.part_count,
          icon: item.icon,
        }));
      } else {
        // If the response is a single object, wrap it in an array
        fetchedSubcategories = [
          {
            id: data.pk,
            name: data.name,
            description: data.description,
            partCount: data.part_count,
            icon: data.icon,
          },
        ];
      }

      setSubcategories(fetchedSubcategories); // Set the fetched subcategories
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

  // Fetch subcategories and parts when apiUrl or category ID changes
  useEffect(() => {
    if (apiUrl) {
      fetchSubcategories();
      fetchParts();
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
            <View>
              <ThemedText style={styles.subcategoryHeader}>Subcategories</ThemedText>
              {subcategories.map(({ id, name, description, partCount, icon }) => (
                <CategoryCard
                  key={id}
                  name={name}
                  description={description}
                  partCount={partCount}
                  icon={icon}
                  categoryId={id} // Pass the subcategory ID to the card
                />
              ))}
            </View>
          ) : (
            <ThemedText style={styles.noResults}>No subcategories found.</ThemedText>
          )}

          {parts.length > 0 ? (
            <View>
              <ThemedText style={styles.partsHeader}>Parts</ThemedText>
              {parts.map(({ id, name, description, image, stock, partId }) => (
                <PartCard
                  key={id}
                  name={name}
                  stock={stock}
                  image={image}
                  //description={description} // Use imageUrl as per your logic
                  partId={id}
                />
              ))}
            </View>
          ) : (
            <ThemedText style={styles.noResults}>No parts found.</ThemedText>
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
  subcategoryHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  partsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
});

