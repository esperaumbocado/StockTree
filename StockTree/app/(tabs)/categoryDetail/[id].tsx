import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, useColorScheme, ScrollView, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CategoryCard from '@/components/CategoryCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PartCard } from '@/components/PartCard'; // Import PartCard component
import { loadToken,  } from '@/utils/utils';
import { useFocusEffect } from '@react-navigation/native';


export default function DetailsScreen() {
  const { id, categoryName } = useLocalSearchParams(); // Get the category ID and name from params
  const colorScheme = useColorScheme();
  const [subcategories, setSubcategories] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [apiUrl, setApiUrl] = useState(''); // Define apiUrl state
  const [offset, setOffset] = useState(0);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(false);

  const defToken = async () => {
    const storedToken = await loadToken();
    if( storedToken){
        setToken(storedToken);
        console.log('TOKEN:', storedToken);
    }
  };

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
    if( !apiUrl || !token) return;
    try {
      setLoading(true);
      const currentOffset = offset;
      const params = new URLSearchParams({
        category: id,
        limit: limit.toString(),
        offset: offset.toString(),
      });

      console.log('Request Params (Parts): ', params.toString());

      const apiEndpoint = `${apiUrl}/api/part/?${params.toString()}`;
      console.log('API ENDPOINT (Parts): ', apiEndpoint);
      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: {
          Authorization: `Token ${token}`,
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
      if (!Array.isArray(data)) {
        fetchedParts = data.results.map((item) => {
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
        console.log("AAAAAAAAAaa");
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
      console.log('PARTS1:', data);
      setParts(prev =>  [...prev, ...fetchedParts]);
      console.log('PARTS:', fetchedParts);
      setOffset(currentOffset + limit);
      console.log('currentOffset, limit:', currentOffset, limit);
      console.log('data.next:', data.next);
      setHasMore(Boolean(data.next));

      //setParts(fetchedParts);
    } catch (error) {
      console.error('Error fetching parts:', error.message);
    } finally {
      setLoading(false);
    }
  };



  // Fetch subcategories of the current category
  const fetchSubcategories = async () => {
    if( !apiUrl || !token){ return;}
    try {
      setLoading(true);

      console.log('API URL:', apiUrl);

      const params = new URLSearchParams({
        parent: id,
        cascade: true,
        ordering: 'name',
        depth: 1,
      });

      console.log('Request Params:', params.toString());

      const apiEndpoint = `${apiUrl}/api/part/category/?${params.toString()}`;


      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: {
          Authorization: `Token ${token}`,
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
    defToken();
    loadApiUrl();

  }, []);

  // Fetch subcategories and parts when apiUrl or category ID changes
  useEffect(() => {
    if (apiUrl && token ) {
      fetchSubcategories();
      fetchParts();
    }
  }, [apiUrl, token, id]);

  useFocusEffect(
    useCallback(() => {
        loadApiUrl();
        defToken();
    }, [])
  );  // runs when the screen is focused

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
            <ScrollView>
              <ThemedText style={styles.partsHeader}>Parts</ThemedText>

                {parts.map((part, index) => {
                  console.log('Rendering PartCard with id:', part.id); // 👈 Log part id here
                  return (
                    <PartCard
                      key={part.id ?? `part-${index}`}
                      name={part.name}
                      stock={part.stock}
                      image={part.image}
                      partId={part.id}
                      apiUrl={apiUrl}
                      token={token}
                    />
                  );
                })}

              {hasMore && !loading && (
                <TouchableOpacity onPress={() => fetchParts()} style={styles.loadMoreButton}>
                  <ThemedText style={styles.loadMoreText}>Load More</ThemedText>
                </TouchableOpacity>
              )}
            </ScrollView>
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
  loadMoreButton: {
    marginTop: 20,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#C2F0E0',
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D3D47',
  },
});

