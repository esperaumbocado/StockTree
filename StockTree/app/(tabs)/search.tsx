import { useEffect, useState } from 'react';
import { Image, StyleSheet, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PartCard } from '@/components/PartCard';


const API_URL = 'http://inventree.localhost/api/part/';

const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch search results from API
  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    
    if (text.length < 2) {
      setResults([]); // Clear results if input is too short
      return;
    }
    console.log('search status:', searchQuery);
    const params = new URLSearchParams({
              search: searchQuery,
            });

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?${params.toString()}`, {
            method: 'GET',
            headers: {
              'Authorization': 'Token inv-d3705ca8173ca063004eb382caed18a7c169ebd2-20250305',
              //'Content-Type': 'application/json',
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
      const data = await response.json();
      console.log('data:', data);
      if (!data) {
                throw new Error('Empty response received.');
      }
      console.log('Raw response data:', data);
      const BASE_URL = "http://inventree.localhost";
      const parts = data.map(item => ({
                id: item.pk,                          // Mapping pk to id
                name: item.name || 'Unknown',  // Using name for location name
                stock: item.in_stock,                 // Using stock for showing available stock

      }));

      setResults(parts || []);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  };
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
            <TextInput
                    style={styles.searchBar}
                    placeholder="Search items..."
                    value={searchQuery}
                    onChangeText={handleSearch}
                  />
          {loading ? (
            <ActivityIndicator size="large" color="#000" style={styles.loader} />
          ) : (
            <ScrollView style={styles.cardContainer}>
              {results.map(({ id, name, stock}) => (
                <PartCard
                  key={id}
                  name={name}
                  stock={stock}

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
      searchBar: {
            height: 40,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            paddingHorizontal: 10,
            marginBottom: 10,
      },
    });
export default SearchPage;
