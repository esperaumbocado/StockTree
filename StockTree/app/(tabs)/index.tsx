import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, ActivityIndicator, RefreshControl, StyleSheet, useColorScheme, View, Image } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import CategoryCard from '@/components/CategoryCard';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiUrl, setApiUrl] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      await loadApiUrl();
      if (!apiUrl) return;

      const params = new URLSearchParams({
        cascade: false, // Example limit, adjust as necessary
        ordering: 'name',
      });

      const response = await fetch(`${apiUrl}/?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Token inv-969802229ef25a65ede9ab5248af5eb3be0b7d2f-20250227',
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

      const fetchedCategories = data.map(item => ({
        id: item.pk,
        name: item.name,
        description: item.description,
        partCount: item.part_count,
        icon: item.icon,
      }));

      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadApiUrl = async () => {
    const storedUrl = await SecureStore.getItemAsync('API_URL');
    if (storedUrl) {
      setApiUrl(`${storedUrl}/api/part/category`);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
  };

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [apiUrl])
  );

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
            Categories
          </ThemedText>
        </ThemedView>
      </ParallaxScrollView>

      {loading ? (
        <ActivityIndicator size="large" color="#A1E8C5" style={styles.loader} />
      ) : (
        <View style={styles.categoryContainer}>
          {categories.map(({ id, name, description, partCount, icon }) => (
            <CategoryCard
              key={id}
              name={name}
              description={description}
              partCount={partCount}
              icon={icon}
              navigation={navigation} // Pass navigation to CategoryCard
              categoryId={id} // Pass the category ID to the card
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
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
  categoryContainer: {
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
