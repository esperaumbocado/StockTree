
import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, ActivityIndicator, RefreshControl, StyleSheet, useColorScheme, View, Image, Button, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import LocationPageCard from '@/components/LocationPageCard';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { loadToken,  } from '@/utils/utils';
import { SafeAreaView } from "react-native-safe-area-context";


export default function Locations() {
  const router = useRouter(); // Define router
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiUrl, setApiUrl] = useState('');
  const [token, setToken] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    loadApiUrl();
    defToken();
  }, []);

  useFocusEffect(
    useCallback(() => {

        loadApiUrl();
        defToken();
    }, [])
  );  // runs when the screen is focused


  const fetchLocations = async () => {
    try {
      if (!apiUrl || !token) return;
      setLoading(true);

      const params = new URLSearchParams({
        cascade: false, // Example limit, adjust as necessary
        ordering: 'name',
      });

      const response = await fetch(`${apiUrl}/api/stock/location/?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Accept': 'application/json',
          'Connection': 'keep-alive',
          'Host': 'inventree.localhost',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const rawData = await response.text();

      let data;
      try {
        data = JSON.parse(rawData);  // Attempt to parse the response as JSON
      } catch (e) {
        throw new Error('Error parsing JSON response: ' + e.message);
      }

      const fetchedLocations = data.map(item => ({
        id: item.pk,
        name: item.name,
        description: item.description,
        items: item.items,
        subLocations: item.sublocations,
      }));

      setLocations(fetchedLocations);
      console.log('fetchedLCTS: ', fetchedLocations);
    } catch (error) {
      console.error('Error fetching locations:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const defToken = async () => {
    const storedToken = await loadToken();
    if( storedToken){
        setToken(storedToken);
        console.log('TOKEN:', storedToken);
    }
  };

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
      }
    } catch (error) {
      console.error('Error loading API URL:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLocations();
  };

  useFocusEffect(
    useCallback(() => {
      fetchLocations();
    }, [apiUrl, token])
  );

  return (
      <SafeAreaView style={{ flex: 1 }}>
      <ScrollView

      >
        <ParallaxScrollView
          headerBackgroundColor={{ light: '#A1E8C5', dark: '#A1E8C5' }}
          contentBackgroundColor="white"
          headerImage={
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/fraunhofer.png')}
                style={styles.logo}
              />
            </View>
          }
        >
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title" style={[styles.headerText, { color: colorScheme === 'dark' ? '#fff' : '#1D3D47' }]}>
              Locations
            </ThemedText>
          </ThemedView>
        </ParallaxScrollView>

        {loading ? (
          <ActivityIndicator size="large" color="#A1E8C5" style={styles.loader} />
        ) : (
          <View style={styles.locationContainer}>
            {locations.map(({ id, name, items, subLocations, description}) => (
              <LocationPageCard
                key={id}
                name={name}
                description={description}
                items={items}
                subLocations={subLocations}
                locationId={id} // Pass the location ID to the card
              />
            ))}
          </View>
        )}
      </ScrollView>
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  titleLocation: {
    alignItems: 'center',
    marginVertical: 16,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
  },
  locationContainer: {
    padding: 16,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 250,
    flexDirection: 'column',
  },
  logo: {
    height: 100,
    width: '80%',
    borderRadius: 10,
    marginBottom: 16,
  },
});
