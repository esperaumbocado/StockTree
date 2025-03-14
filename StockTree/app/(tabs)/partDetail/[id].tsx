import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PartCard from '@/components/CategoryCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function DetailsScreen() {
  const { id, partName } = useLocalSearchParams(); // Get the category ID and name from params
  const colorScheme = useColorScheme();
  const [part, setPart] = useState([]);
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
        setApiUrl(`${storedUrl}/api/part`);
      } else {
        console.error('API URL not found in storage.');
      }
    } catch (error) {
      console.error('Error loading API URL:', error.message);
    }
  };

  // Fetch the part selected
  const fetchPart = async () => {
    try {
      setLoading(true);

      if (!apiUrl) {
        console.error('API URL is not set.');
        return;
      }

      console.log('API URL:', apiUrl);

      const params = new URLSearchParams({
        parent: id,
      });

      console.log('Request Params:', params.toString());

      const apiEndpoint = `${apiUrl}/${id}/`;

      console.log('Request Headers:', {
        Authorization: 'Token inv-d3705ca8173ca063004eb382caed18a7c169ebd2-20250305',
        Accept: 'application/json',
        Connection: 'keep-alive',
        Host: 'inventree.localhost',
      });

      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: {
          Authorization: 'Token inv-d3705ca8173ca063004eb382caed18a7c169ebd2-20250305',
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
      let fetchedPart;
        fetchedPart =
          {
            id: data.pk,
            name: data.name,
            description: data.description,
            stock: data.in_stock,
          };

      console.log('FetchedPart', fetchedPart);
      setPart(fetchedPart);
    } catch (error) {
      console.error('Error fetching part:', error.message);
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
      fetchPart();
    }
  }, [apiUrl, id]);

  return (
    <ScrollView style={{ flex: 1 }}>
      <ThemedView style={[styles.headerContainer, { backgroundColor: colorScheme === 'dark' ? '#A1E8C5' : '#A1E8C5' }]}>
        <ThemedText type="title" style={[styles.headerText, { color: colorScheme === 'dark' ? '#fff' : '#1D3D47' }]}>
          {partName}
        </ThemedText>
      </ThemedView>

      {loading ? (
        <ActivityIndicator size="large" color="#A1E8C5" style={styles.loader} />
      ) : (
        <View style={styles.categoryContainer}>
          {part ? (
              <>
                    <Text style={[styles.headerText, { color: colorScheme === 'dark' ? '#fff' : '#1D3D47' }]}>Description: {part.description}</Text>
                    <Text style={[styles.headerText, { color: colorScheme === 'dark' ? '#fff' : '#1D3D47' }]}>Stock: {part.stock}</Text>
                  </>
            ) : (
              <ThemedText style={styles.noResults}>No Part found.</ThemedText>
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
