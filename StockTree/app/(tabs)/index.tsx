import { useEffect, useState } from 'react';
import { Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import LocationCard from '@/components/LocationCard';

const API_URL = 'http://10.227.151.2/api/stock/location/';

export default function HomeScreen() {
  const [storageLocations, setStorageLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        console.log('Starting fetch request to:', API_URL);

        // Query Parameters
        const params = new URLSearchParams({
          limit: 100,
          ordering: 'name',
          cascade: false,
        });

        const response = await fetch(`${API_URL}?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Authorization': 'Token inv-969802229ef25a65ede9ab5248af5eb3be0b7d2f-20250227',
            'Content-Application': 'application/json',
            'Accept': 'application/json',
            'Connection': 'keep-alive',
            'Host': 'inventree.localhost',
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:135.0) Gecko/20100101 Firefox/135.0',
          },
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const rawData = await response.text();

        console.log('Raw response text:', rawData);

        if (!rawData) {
          throw new Error('Empty response received.');
        }

        let data;
        try {
          data = JSON.parse(rawData);
        } catch (e) {
          throw new Error('Error parsing JSON response');
        }

        console.log('Fetched data:', data);

        const locations = data.results.map(item => ({
          id: item.pk,                          // Mapping pk to id
          locationName: item.name || 'Unknown',  // Using name for location name
          capacity: item.items,                 // Using items as capacity
          itemsStored: item.tags.length || 0,    // Counting tags for items stored
          sublocations: item.sublocations,      // Using sublocations as needed
          locationType: item.location_type,     // Optionally map location_type
        }));

        setStorageLocations(locations);
      } catch (error) {
        console.error('Error fetching storage locations:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={{ uri: 'https://via.placeholder.com/100' }}  // Example placeholder image
          style={styles.logo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Stock Management</ThemedText>
      </ThemedView>

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
    </ParallaxScrollView>
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
