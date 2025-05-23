import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, ScrollView, ActivityIndicator, Platform, TouchableOpacity, Modal } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImageCard from '@/components/ImageCard';
import StockItemCard from '@/components/StockItemCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { fetchStockItemsForPart,  } from '@/utils/utils';

export default function DetailsScreen() {
  const { id, partName } = useLocalSearchParams(); // Get part ID and name from params
  const colorScheme = useColorScheme();
  const [part, setPart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiUrl, setApiUrl] = useState('');
  const [counter, setCounter] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [stockItems, setStockItems] = useState([]);

  useEffect(() => {
    const loadApiUrl = async () => {
      try {
        const storedUrl = Platform.OS === 'web'
          ? await AsyncStorage.getItem('API_URL')
          : await SecureStore.getItemAsync('API_URL');

        if (storedUrl) {
          setApiUrl(storedUrl);
        } else {
          console.error('API URL not found in storage.');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading API URL:', error.message);
        setLoading(false);
      }
    };
    loadApiUrl();
  }, []);

  const handleCheckStockLocations = async () => {
        try {
          setLoading(true);
          // function that makes API call to get stock items for the part
          const fetchedStockItems = await fetchStockItemsForPart(part.id, apiUrl);
          // Set the fetched stock items to the state
          setStockItems(fetchedStockItems);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching stock locations:', error);
        }
  };

  const fetchPart = async () => {
      try {
        setLoading(true);

        const apiEndpoint = `${apiUrl}/api/part/${id}/`;

        const response = await fetch(apiEndpoint, {
          method: 'GET',
          headers: {
            Authorization: 'Token inv-14194edbbb32e2d6074ecd7b0ccf4dba4c754bc6-20250228',
            Accept: 'application/json',
            Connection: 'keep-alive',
            Host: 'inventree.localhost',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        const fetchedPart = {
          id: data.pk,
          name: data.name,
          description: data.description,
          stock: data.in_stock,
          image: data.image ? `${apiUrl}${data.image}` : null,
        };

        setPart(fetchedPart);
      } catch (error) {
        console.error('Error fetching part:', error.message);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    if (!apiUrl) return;

    fetchPart();
  }, [apiUrl, id]);

  useEffect(() => {
    if (part) {
      handleCheckStockLocations();
    }
  }, [part]);

  const refreshData = async () => {
    await fetchPart();
    if (part) {
      await handleCheckStockLocations();
    }
  };
  const handleRemoveStock = async (counter, stockItem) => {
    try {
      const response = await fetch(`${apiUrl}/api/stock/remove/`, {
        method: 'POST',
        headers: {
          'Authorization': 'Token inv-14194edbbb32e2d6074ecd7b0ccf4dba4c754bc6-20250228',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              pk: stockItem.pk,  // StockItem ID
              quantity: counter,  // Quantity to remove
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to remove stock: ${response.status}`);
      }

      const data = await response.json();
      console.log('Stock removed successfully:', data);
      refreshData();
    } catch (error) {
      console.error('Error removing stock:', error.message);
    }
  };


  return (
    <ScrollView style={{ flex: 1 }}>
      <ThemedView style={[styles.headerContainer, { backgroundColor: '#A1E8C5' }]}>
        <ThemedText type="title" style={[styles.headerText, { color: colorScheme === 'dark' ? '#fff' : '#1D3D47' }]}>
          {partName}
        </ThemedText>
      </ThemedView>

      {loading ? (
        <ActivityIndicator size="large" color="#A1E8C5" style={styles.loader} />
      ) : (
        <View style={styles.partContainer}>
          {part ? (
            <>
              <Text style={[styles.infoText, { color: colorScheme === 'dark' ? '#fff' : '#1D3D47' }]}>
                Description: {part.description}
              </Text>
              <Text style={[styles.infoText, { color: colorScheme === 'dark' ? '#fff' : '#1D3D47' }]}>
                Stock: {part.stock}
              </Text>
              <ImageCard
                imageLink={part.image}
                token="inv-14194edbbb32e2d6074ecd7b0ccf4dba4c754bc6-20250228"
              />

              {stockItems && stockItems.length > 0 ? (<View>
                   {stockItems.map((item) => (
                    <StockItemCard key={item.pk} stockItem={item} apiUrl={apiUrl} refreshData={refreshData} />
                  ))}
              </View>
              ) : (

                <ThemedText style={styles.noResults}>No stock locations found.</ThemedText>
              )}

            </>
          ) : (
            <ThemedText style={styles.noResults}>No part found.</ThemedText>
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
  partContainer: {
    padding: 16,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  buttonRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    elevation: 3,
  },
  submitButton: {
      backgroundColor: "green",
  },
  button: {
      backgroundColor: '#1D3557',
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      marginTop: 20,
  },
  buttonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
  },
});

export default DetailsScreen;
