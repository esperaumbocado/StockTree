import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, useColorScheme, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyPartCard } from '@/components/MyPartCard';

// import your part card or list item component here, if you have one
// import PartItemCard from '@/components/PartItemCard';

export default function MyPartsScreen() {
  const colorScheme = useColorScheme();
  const [myParts, setMyParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiUrl, setApiUrl] = useState('');
  const SELECTED_PARTS_KEY = "selected_parts";
  // Load the API URL from storage (SecureStore for mobile, AsyncStorage for web)
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
        console.log('API URL:', storedUrl);
      }
    } catch (error) {
      console.error('Error loading API URL:', error);
    }
  };


  // Get ids from the parts in MyParts
  const getSelectedPartIds = async (): Promise<number[]> => {
    try {
      const stored = await AsyncStorage.getItem(SELECTED_PARTS_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        console.warn('Stored selected_parts is not an array:', parsed);
        return [];
      }

      // Optionally filter expired (e.g., 24h expiration)
      //const now = Date.now();
      //const validItems = parsed.filter(item => now - item.timestamp < 86400000);

      return parsed.map(item => item.partId);
    } catch (error) {
      console.error('Failed to load selected part IDs:', error);
      return [];
    }
  };

  const fetchMultipleParts = async (ids: number[], apiUrl: string, token: string) => {
    try {
      const partPromises = ids.map(id =>
        fetch(`${apiUrl}/api/part/${id}/`, {
          method: 'GET',
          headers: {
            Authorization: `Token ${token}`,
            Accept: 'application/json',
          },
        }).then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch part with ID ${id}`);
          }
          return response.json();
        })
      );

      const parts = await Promise.all(partPromises);
      return parts;
    } catch (error) {
      console.error('Error fetching multiple parts:', error);
      return [];
    }
  };

  const fetchMyParts = async () => {
    try {
      if (!apiUrl) return; // Don't fetch if the URL is not yet loaded
      const ids = await getSelectedPartIds();
      setLoading(true); // Set loading state before fetching parts
      const data = await fetchMultipleParts(ids, apiUrl, 'inv-8424bedbeceb27da942439fff71390388e87f3fe-20250321');

      setMyParts(data); // Set parts data to state
    } catch (error) {
      console.error('Error fetching parts:', error.message);
    } finally {
      setLoading(false); // Set loading to false once fetching is complete
    }
  };

  useEffect(() => {
    loadApiUrl();
  }, []); // runs only once when the component mounts

  // Effect to fetch parts when API URL is loaded
  useEffect(() => {
    if (apiUrl) {
      fetchMyParts();
    }
  }, [apiUrl]); // runs when apiUrl changes

  useFocusEffect(
    useCallback(() => {
    // runs every time the screen is focused
    fetchMyParts();

    }, [apiUrl]) // dependencies
  );
  console.log('myParts:', myParts);
  // Return MyPartCards with header
  return (
    <ScrollView style={{ flex: 1 }}>
      <ThemedView style={[styles.headerContainer, { backgroundColor: '#A1E8C5' }]}>
        <ThemedText type="title" style={[styles.headerText, { color: colorScheme === 'dark' ? '#fff' : '#1D3D47' }]}>
          Project Parts List
        </ThemedText>
      </ThemedView>

      {loading ? (
        <ActivityIndicator size="large" color="#A1E8C5" style={styles.loader} />
      ) : (
        <View style={styles.listContainer}>

          {myParts.length > 0 ? ( <View >
            {myParts.map((part) => (
                <MyPartCard key = {part.pk} name = {part.name} stock={part.in_stock} image = {part.image ? `${apiUrl}${part.image}` : null} />
                ))}
            </View>

          ) : (
            <ThemedText style={styles.empty}>No parts selected.</ThemedText>
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
  listContainer: {
    padding: 16,
  },
  empty: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#999',
  },
  card: {
    margin: 10,
    padding: 10,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: "#fff",
  },
});


export default MyPartsScreen;