import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, useColorScheme, ScrollView, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LocationPageCard from '@/components/LocationPageCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PartCard } from '@/components/PartCard'; // Import PartCard component
import { loadToken,  } from '@/utils/utils';
import { useFocusEffect } from '@react-navigation/native';


export default function DetailsScreen() {
  const { id, locationName } = useLocalSearchParams(); // Get the category ID and name from params
  const colorScheme = useColorScheme();
  const [sublocations, setSublocations] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [apiUrl, setApiUrl] = useState(''); // Define apiUrl state
  const [offset, setOffset] = useState(0);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(false);
  var ind = 0;
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
        location: id,
        limit: limit.toString(),
        offset: offset.toString(),
      });

      console.log('Request Params (Parts): ', params.toString());

      const apiEndpoint = `${apiUrl}/api/stock/?${params.toString()}`;
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

      let data;
      try {
        data = JSON.parse(rawData);
      } catch (e) {
        throw new Error('Error parsing JSON response (Parts): ' + e.message);
      }

      console.log("Parsed Data (Parts): ", data);

      let fetchedParts;
      fetchedParts = await Promise.all(data.results.map(async (item) => {
          const partId = item.part;
          const stock = item.quantity;

          try {
              const partResponse = await fetch(`${apiUrl}/api/part/${partId}/`, {
                method: 'GET',
                headers: {
                  Authorization: `Token ${token}`,
                  Accept: 'application/json',
                  Connection: 'keep-alive',
                  Host: 'inventree.localhost',
                },
              });

              if (!partResponse.ok) {
                throw new Error(`Error searching part ${partId}: ${partResponse.status}`);
              }

              const partData = await partResponse.json();
              const imageUrl = partData.image ? `${apiUrl}${partData.image}` : null;

              return {
                id: partId,
                name: partData.name,
                image: imageUrl,
                stock: stock,
              };

            } catch (err) {
              console.error(`Erro ao processar parte ${partId}:`, err);
              return {
                id: partId,
                name: 'Error searching name',
                image: null,
                stock: stock,
              };
      }}));
      console.log(fetchedParts);
      setParts(prev =>  [...prev, ...fetchedParts]);
      setOffset(currentOffset + limit);
      setHasMore(Boolean(data.next));

      //setParts(fetchedParts);
    } catch (error) {
      console.error('Error fetching parts:', error.message);
    } finally {
      setLoading(false);
    }
  };



  // Fetch subcategories of the current category
  const fetchSublocations = async () => {
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

      const apiEndpoint = `${apiUrl}/api/stock/location/?${params.toString()}`;


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

      let data;
      try {
        data = JSON.parse(rawData);
      } catch (e) {
        throw new Error('Error parsing JSON response: ' + e.message);
      }

      console.log('Parsed Data:', data); // Log the parsed data

      // Handle both array and object responses
      let fetchedSublocations;
      if (Array.isArray(data)) {
        // If the response is an array, map it directly
        fetchedSublocations = data.map((item) => ({
          id: item.pk,
          name: item.name,
          description: item.description,
          items: item.items,
          subLocations: item.sublocations,
        }));
      } else {
        // If the response is a single object, wrap it in an array
        fetchedSublocations = [
          {
            id: data.pk,
            name: data.name,
            description: data.description,
            items: data.items,
            subLocations: data.sublocations,
          },
        ];
      }

      setSublocations(fetchedSublocations); // Set the fetched subcategories
    } catch (error) {
      console.error('Error fetching sublocations:', error.message);
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
      fetchSublocations();
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
      <ThemedView style={[styles.headerContainer, { backgroundColor: colorScheme === 'dark' ? '#1D473D' : '#A1E8C5' }]}>
        <ThemedText type="title" style={[styles.headerText, { color: colorScheme === 'dark' ? '#fff' : '#1D3D47' }]}>
          {locationName}
        </ThemedText>
      </ThemedView>

      {loading ? (
        <ActivityIndicator size="large" color="#A1E8C5" style={styles.loader} />
      ) : (
        <View style={styles.categoryContainer}>
          {sublocations.length > 0 ? (
            <View>
              <ThemedText style={styles.subcategoryHeader}>Sublocations</ThemedText>
              {sublocations.map(({ id, name, description, items, subLocations }) => (
                <LocationPageCard
                  key={id}
                  name={name}
                  description={description}
                  items={items}
                  subLocations={subLocations}
                  locationId={id} // Pass the sublocation ID to the card

                />
              ))}
            </View>
          ) : (
            <ThemedText style={styles.noResults}>No sublocations found.</ThemedText>
          )}

          {parts.length > 0 ? (
            <ScrollView>
              <ThemedText style={styles.partsHeader}>Parts</ThemedText>

                {parts.map((part, index) => {

                  return (
                    <PartCard
                      key={ind++}
                      name={part.name}
                      stock={part.stock}
                      image={part.image}
                      partId={part.id}
                      apiUrl={apiUrl}
                      token={token}
                      from={'locations'}
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

