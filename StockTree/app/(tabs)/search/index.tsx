import { useEffect, useState, useCallback } from 'react';
import { Image, StyleSheet, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Platform, useColorScheme, View } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PartCard } from '@/components/PartCard';
import Icon from 'react-native-vector-icons/FontAwesome';
import { loadToken,  } from '@/utils/utils';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from "react-native-safe-area-context";


const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const colorScheme = useColorScheme();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [apiUrl, setApiUrl] = useState('');
  const [token, setToken] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit] = useState(20);
  const [hasMore, setHasMore] = useState(false);


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

  const defToken = async () => {
    const storedToken = await loadToken();
    if( storedToken){
        setToken(storedToken);
        console.log('TOKEN:', storedToken);
    }
  };

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

  const fetchSearchResults = async (reset = false) => {
    if (!apiUrl || !token || loading || (!hasMore && !reset)) return;

    setLoading(true);
    const currentOffset = reset ? 0 : offset;

    const params = new URLSearchParams();
    params.append('search', searchQuery);
    params.append('limit', limit.toString());
    params.append('offset', currentOffset.toString());

    try {
      const response = await fetch(`${apiUrl}/api/part/?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      const parts = data.results.map(item => ({
        id: item.pk,
        name: item.name || 'Unknown',
        stock: item.in_stock,
        image: item.image ? `${apiUrl}${item.image}` : null,
      }));

      setResults(prev => reset ? parts : [...prev, ...parts]);
      setOffset(currentOffset + limit);
      setHasMore(Boolean(data.next));
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);

  };

  const handleSearchButtonPress = () => {
    setOffset(0);
    setHasMore(true);
    fetchSearchResults(true);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1E8C5', dark: '#A1E8C5' }}
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
        <ThemedText type="title" style={[styles.headerText, { color: colorScheme === 'dark' ? '#fff' : '#1D3D47' }]}>Search</ThemedText>
      </ThemedView>

      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchBar, { color: 'black' }]}
          placeholder="Search for parts..."
          value={searchQuery}
          onChangeText={handleSearch}
          onSubmitEditing={handleSearchButtonPress} // Trigger search on keyboard submit
          returnKeyType="search"                    // Shows "Search" or "Done" on the keyboard
          placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#999'}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchButtonPress}>
          <Icon name="search" size={20} color={'#00a481'} />
        </TouchableOpacity>
      </View>

      {loading && results.length === 0 ? (
        <ActivityIndicator size="large" color="#000" style={styles.loader} />
      ) : (
        <ScrollView style={styles.cardContainer}>
          {results.length === 0 && !loading ? (
            <ThemedText style={styles.noResultsText}>No matches found!</ThemedText>
          ) : (
            <>
              {results.map(({ id, name, stock, image }) => (
                <PartCard
                  key={id}
                  name={name}
                  stock={stock}
                  image={image}
                  partId={id}
                  apiUrl={apiUrl}
                  token={token}
                  from={'search'}
                />
              ))}
              {hasMore && !loading && (
                <TouchableOpacity
                  onPress={() => fetchSearchResults(false)}
                  style={styles.loadMoreButton}
                >
                  <ThemedText style={styles.loadMoreText}>Load More</ThemedText>
                </TouchableOpacity>
              )}
            </>
          )}
          {loading && (
            <ActivityIndicator size="small" color="#666" style={styles.loader} />
          )}
        </ScrollView>

      )}
    </ParallaxScrollView>
    </SafeAreaView>
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
    marginVertical: 20,
  },
  cardContainer: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 12,
    //paddingHorizontal: 16,
  },
  searchBar: {
    flex: 1,
    height: 48,
    //borderWidth: 1.5,
    //borderColor: '#fff',
    //borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',

  },
  searchButton: {
    marginLeft: 10,
    padding: 10,
    borderRadius: 8,
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
  noResultsText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#666',
  },

});

export default SearchPage;
