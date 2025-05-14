import { useEffect, useState } from 'react';
import { Image, StyleSheet, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Platform, useColorScheme, View, Scrollview } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PartCard } from '@/components/PartCard';
import Icon from 'react-native-vector-icons/FontAwesome';

const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const colorScheme = useColorScheme();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    loadApiUrl();
  }, []);
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

  // Fetch search results from API
  const handleSearch = async (text: string) => {
      setSearchQuery(text);
      }

  const handleSearchButtonPress = async (text: string) => {

    console.log('search status:', searchQuery);

    const params = new URLSearchParams();
    params.append('search', searchQuery);

    console.log('PARAMS:', params.toString());

    try {
      setLoading(true);
      //loadApiUrl();
      if (!apiUrl) return;
      const response = await fetch(`${apiUrl}/api/part/?${params.toString()}`, {
            method: 'GET',
            headers: {
              'Authorization': 'Token inv-8424bedbeceb27da942439fff71390388e87f3fe-20250321',
              //'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Connection': 'keep-alive',
              'Host': 'inventree.localhost',

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
      const parts = data.map(item => ({
                id: item.pk,                          // Mapping pk to id
                name: item.name || 'Unknown',  // Using name for location name
                stock: item.in_stock,                 // Using stock for showing available stock
                image: item.image ? `${apiUrl}${item.image}` : null, // ImageURL


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
              Search
            </ThemedText>
          </ThemedView>

          <View style={styles.searchContainer}>
          <TextInput
                style={[
                  styles.searchBar,
                  { color: colorScheme === 'dark' ? '#fff' : '#1D3D47' }, // Input text color
                ]}
                placeholder="Search for parts..."
                value={searchQuery}
                onChangeText={handleSearch}
                placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#999'}
          />
              <TouchableOpacity style={styles.searchButton} onPress={handleSearchButtonPress}>
                <Icon name="search" size={20} color={'#00a481'} />
              </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#000" style={styles.loader} />
          ) : (
            <ScrollView style={styles.cardContainer}>
              {results.map(({ id, name, stock, image}) => (
                <PartCard
                  key={id}
                  name={name}
                  stock={stock}
                  image={image}
                  partId={id}
                  apiUrl={apiUrl}

                />
              ))}
            </ScrollView>
          )}
        </ParallaxScrollView>
      );
    }

    const styles = StyleSheet.create({
      headerText: {
        fontSize: 28,
        fontWeight: '600',
        textAlign: 'center',
      },
      titleContainer: {
        alignItems: 'center',
        marginVertical: 16,
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
      loader: {
        marginTop: 20,
      },
      cardContainer: {
        padding: 16,
      },
      searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 16,
      },
      searchBar: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
      },
      searchButton: {
        marginLeft: 10,
        padding: 10,
        borderRadius: 8,
        //backgroundColor: '#C2F0E0',

      },

    });
export default SearchPage;
