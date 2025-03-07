import React, { useState, useEffect, useCallback } from 'react';
import { Image, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, useColorScheme, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import LocationCard from '@/components/LocationCard';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen() {
  const [storageLocations, setStorageLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiUrl, setApiUrl] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();  // Get the current theme (light or dark)

  const fetchLocations = async () => {
    try {
      setLoading(true);
      await loadApiUrl();
      if (!apiUrl) return;

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

  const loadApiUrl = async () => {
    const storedUrl = await SecureStore.getItemAsync('API_URL');
    if (storedUrl) {
      setApiUrl(`${storedUrl}/api/stock/location/`);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLocations();
    }, [apiUrl])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLocations();
  };

  // Get dynamic background and text colors based on theme
  const headerBackgroundColor = '#A1E8C5'; // Same green for both light and dark mode
  const logoBorderColor = colorScheme === 'dark' ? '#A1E8C5' : '#1D3D47'; // Adjust for contrast in dark mode
  const headerTextColor = colorScheme === 'dark' ? '#fff' : '#1D3D47'; // Light text in dark mode
  const cardBackgroundColor = colorScheme === 'dark' ? '##fff' : '#F4F9FA'; // Darker background for cards in dark mode

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
        headerBackgroundColor={{ light: headerBackgroundColor, dark: headerBackgroundColor }} // Same green for header in both modes
        headerImage={
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/fraunhofer.png')}
              style={[styles.logo, { borderColor: logoBorderColor }]}
            />
          </View>
        }
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title" style={[styles.headerText, { color: headerTextColor }]}>
            Stock Management
          </ThemedText>
        </ThemedView>
      </ParallaxScrollView>

      {loading ? (
        <ActivityIndicator size="large" color="#A1E8C5" style={styles.loader} />
      ) : (
        <ScrollView style={[styles.cardContainer, { backgroundColor: cardBackgroundColor }]}>
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
  logoContainer: {
    flex: 1,  // Allow the container to take up available space
    justifyContent: 'center',  // Vertically center the logo
    alignItems: 'center',  // Horizontally center the logo
    minHeight: 120,  // Ensure there's enough space for centering
  },
  logo: {
    height: 120,
    width: '80%',  // Adjust width to make the logo more prominent horizontally
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16, // Space below logo
  },
  headerText: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
  },
  cardContainer: {
    padding: 20,
  },
});
