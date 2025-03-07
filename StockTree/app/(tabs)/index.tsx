import React, { useState, useEffect, useCallback } from 'react';  // Import React and useCallback
import { Image, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import LocationCard from '@/components/LocationCard';
import { useFocusEffect } from '@react-navigation/native';  // Import useFocusEffect

export default function HomeScreen() {
  const [storageLocations, setStorageLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiUrl, setApiUrl] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch locations function
  const fetchLocations = async () => {
    try {
      setLoading(true); // Start loading when fetching again
      await loadApiUrl();
      if (!apiUrl) return;

      console.log('Starting fetch request to:', apiUrl);

      const params = new URLSearchParams({
        limit: '100',
        ordering: 'name',
        cascade: 'false',
      });

      const response = await fetch(`${apiUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Token inv-969802229ef25a65ede9ab5248af5eb3be0b7d2f-20250227',
          'Content-Application': 'application/json',
          'Accept': 'application/json',
          'Connection': 'keep-alive',
          'Host': 'inventree.localhost',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const rawData = await response.text();
      if (!rawData) {
        throw new Error('Empty response received.');
      }

      let data;
      try {
        data = JSON.parse(rawData);
      } catch (e) {
        throw new Error('Error parsing JSON response');
      }

      const locations = data.results.map(item => ({
        id: item.pk,
        locationName: item.name || 'Unknown',
        capacity: item.items,
        itemsStored: item.tags.length || 0,
        sublocations: item.sublocations,
        locationType: item.location_type,
      }));

      setStorageLocations(locations);
    } catch (error) {
      console.error('Error fetching storage locations:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load API URL from secure storage
  const loadApiUrl = async () => {
    const storedUrl = await SecureStore.getItemAsync('API_URL');
    if (storedUrl) {
      setApiUrl(`${storedUrl}/api/stock/location/`);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLocations(); // Fetch data when the screen is focused
    }, [apiUrl]) // Make sure to re-fetch if apiUrl changes
  );

  // Handle refresh control
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLocations();
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <Image
            source={{ uri: 'https://via.placeholder.com/100' }}
            style={styles.logo}
          />
        }
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Stock Management</ThemedText>
        </ThemedView>
      </ParallaxScrollView>

      {loading ? (
        <ActivityIndicator size="large" color="#000" style={styles.loader} />
      ) : (
        <ScrollView style={styles.cardContainer}>
          {storageLocations.map(({ id, locationName, capacity, itemsStored, sublocations, locationType }) => (
            <LocationCard
              key={id}
              locationName={locationName}
              capacity={capacity}
              itemsStored={itemsStored}
              sublocations={sublocations}
              locationType={locationType}
            />
          ))}
        </ScrollView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  logo: {
    height: 100,
    width: 100,
  },
  loader: {
    marginTop: 20,
  },
  cardContainer: {
    padding: 16,
  },
});
