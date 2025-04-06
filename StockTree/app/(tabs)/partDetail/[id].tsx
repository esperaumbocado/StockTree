import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, ScrollView, ActivityIndicator, Platform, TouchableOpacity, Modal } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImageCard from '@/components/ImageCard';
import StockItemCard from '@/components/StockItemCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

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

  useEffect(() => {
    if (!apiUrl) return;

    const fetchPart = async () => {
      try {
        setLoading(true);
        const apiEndpoint = `${apiUrl}/api/part/${id}/`;

        const response = await fetch(apiEndpoint, {
          method: 'GET',
          headers: {
            Authorization: 'Token inv-8424bedbeceb27da942439fff71390388e87f3fe-20250321',
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

    fetchPart();
  }, [apiUrl, id]);

  const handleRemoveStock = async (counter, stockItem) => {
    try {
      const response = await fetch(`${apiUrl}/api/stock/remove/`, {
        method: 'POST',
        headers: {
          'Authorization': 'Token inv-8424bedbeceb27da942439fff71390388e87f3fe-20250321',
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
    } catch (error) {
      console.error('Error removing stock:', error.message);
    }
  };

  const handleCheckStockLocations = async () => {
      try {
        // Your logic to fetch stock items
        // function that makes API call to get stock items for the part
        await fetchStockItemsForPart(part.id);

        // Show the modal with stock item cards
        setModalVisible(true);
      } catch (error) {
        console.error('Error fetching stock locations:', error);
      }
  };
  const fetchStockItemsForPart = async(partId) => {
      try {
          setLoading(true);
          const params = new URLSearchParams();
          params.append('part', partId);
          const apiEndpoint = `${apiUrl}/api/stock/?${params.toString()}`;

          const response = await fetch(apiEndpoint, {
              method: 'GET',
              headers: {
                'Authorization': 'Token inv-8424bedbeceb27da942439fff71390388e87f3fe-20250321',
                'Accept': 'application/json',
                'Connection': 'keep-alive',
                //'Content-Type': 'application/json',
                'Host': 'inventree.localhost',
              },
          });
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();
          console.log(' :', data);
          // Map the response data into the format required by StockItemCard
          const fetchedStockItems = data.map(item => ({
            pk: item.pk,                          // Primary Key
            part: item.part,                      // Part ID (if needed)
            quantity: item.quantity,              // Quantity in stock
            serial: item.serial || 'N/A',         // Serial number (use 'N/A' if not available)
            batch: item.batch || 'N/A',           // Batch (use 'N/A' if not available)
            location: item.location || 0,         // Location (use default or '0' if not available)
            location_name: item.location_name || 'Unknown Location', // Location name (fallback to 'Unknown')
          }));
          // Set the fetched stock items to the state
          setStockItems(fetchedStockItems);
      } catch (error) {
          console.error('Error retrieving stock of part:', error.message);
        } finally {
          setLoading(false);

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
                token="inv-8424bedbeceb27da942439fff71390388e87f3fe-20250321"
              />
              {/* BUTTON FOR CHECKINg STOCK LOCATIONS */}
               <TouchableOpacity style={styles.button} onPress={handleCheckStockLocations}>
                 <Text style={styles.buttonText}>Check Stock Locations</Text>
               </TouchableOpacity>

               {/* Modal to show stock item cards */}
               <Modal
                 animationType="slide"
                 transparent={true}
                 visible={modalVisible}
                 onRequestClose={() => setModalVisible(false)}
               >
                 <View style={styles.modalOverlay}>
                   <View style={styles.modalContent}>
                     <ScrollView style={styles.scrollView}>
                        {stockItems.map((item) => (
                         <StockItemCard key={item.pk} stockItem={item} handleSubmit={handleRemoveStock} />
                       ))}
                     </ScrollView>

                     <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                       <Text style={styles.closeButtonText}>Close</Text>
                     </TouchableOpacity>
                   </View>
                 </View>
               </Modal>

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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 250,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    margin: 5,
    borderRadius: 8,
    width: 60,
    alignItems: "center",
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
