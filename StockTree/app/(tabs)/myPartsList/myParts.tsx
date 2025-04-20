import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, useColorScheme, ScrollView, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyPartCard } from '@/components/MyPartCard';

// import your part card or list item component here, if you have one
// import PartItemCard from '@/components/PartItemCard';

export default function MyPartsScreen() {
  const colorScheme = useColorScheme();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedParts, setSelectedParts] = useState(new Set()); // or use an array
  const [myParts, setMyParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiUrl, setApiUrl] = useState('');
  const SELECTED_PARTS_KEY = "selected_parts";
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

  const handleRemoveSelected = async () => {
    if (myParts.length > 0) {
      // Filter out parts that are in the selectedParts Set
      //console.log('selectedParts to remove:', selectedParts);
      const updatedParts = myParts.filter(part => !selectedParts.has(part.stockLocationId));

      setMyParts(updatedParts); // Update local state
      //console.log('updatedParts:', updatedParts);
      // Map the parts' ids to a vector of ids to keep in storage
      const partsToStoreIds = updatedParts.map(part => (
        part.stockLocationId
      ));
      //console.log('partsToStoreIds', partsToStoreIds);

      try {
        const stored = await AsyncStorage.getItem(SELECTED_PARTS_KEY);
        let current = stored ? JSON.parse(stored) : [];
        console.log('current:', current);
        const partsToStore = current.filter(item => partsToStoreIds.includes(item.stockLocationId   ));
        //console.log('partsToStore',partsToStore);
        await AsyncStorage.setItem(SELECTED_PARTS_KEY, JSON.stringify(partsToStore));
        console.log("Updated selected parts in storage.");
      } catch (error) {
        console.error("Failed to update stored parts:", error);
      }

      // Reset selection mode and selected parts
      setSelectionMode(false);
      setSelectedParts(new Set());
      // Reload page
      fetchMyParts();
    }
  };

  // Get ids from the parts in MyParts
  const getSelectedPartIds = async (): Promise<number[]> => {
    try {
      const stored = await AsyncStorage.getItem(SELECTED_PARTS_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        console.warn('Stored selected_parts is not an array:', parsed);
        return [];
      }

      // Optionally filter expired (e.g., 24h expiration)
      //const now = Date.now();
      //const validItems = parsed.filter(item => now - item.timestamp < 86400000);

      return parsed.map(item =>({
       partId: item.partId,
       stockLocationId: item.stockLocationId,
      }));
    } catch (error) {
      console.error('Failed to load selected part IDs:', error);
      return [];
    }
  };

  const fetchMultipleParts = async (ids: number[], apiUrl: string, token: string) => {
    try {
      const partPromises = ids.map(id =>
        fetch(`${apiUrl}/api/part/${id}/`, {
          method: 'GET',
          headers: {
            Authorization: `Token ${token}`,
            Accept: 'application/json',
          },
        }).then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch part with ID ${id}`);
          }
          return response.json();
        })
      );

      const parts = await Promise.all(partPromises);
      return parts;
    } catch (error) {
      console.error('Error fetching multiple parts:', error);
      return [];
    }
  };

  const fetchStockItems = async (ids: number[], apiUrl: string, token: string) => {
    try {
      const fetchPromises = ids.map(async (id) => {
        const response = await fetch(`${apiUrl}/api/stock/${id}/`, {
          method: 'GET',
          headers: {
            Authorization: `Token ${token}`,
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch stockItem with PK ${id}`);
        }

        const data = await response.json();

        return {
          stockId: data.pk,
          name: data.location_name,
          available_stock: data.quantity,
        };
      });

      const stockItems = await Promise.all(fetchPromises);
      return stockItems;
    } catch (error) {
      console.error('Error fetching multiple stock items:', error);
      return [];
    }
  };

  const fetchMyParts = async () => {
    try {
      if (!apiUrl) return; // Don't fetch if the URL is not yet loaded
      const partIds = await getSelectedPartIds();
      const ids = partIds.map(item => item.partId);
      const stockIds = partIds.map(item => item.stockLocationId);
      setLoading(true); // Set loading state before fetching parts
      const parts = await fetchMultipleParts(ids, apiUrl, 'inv-8424bedbeceb27da942439fff71390388e87f3fe-20250321');
      const stockItems = await fetchStockItems( stockIds, apiUrl, 'inv-8424bedbeceb27da942439fff71390388e87f3fe-20250321' );

      // Step 1: Build lookup maps for parts and stock items
      const partMap = new Map(parts.map(part => [part.pk, part]));
      const stockMap = new Map(stockItems.map(stock => [stock.stockId, stock]));

      // Step 2: Merge based on partIds
      const mergedData = partIds.map(({ partId, stockLocationId }) => {
        const part = partMap.get(partId);
        const stockItem = stockMap.get(stockLocationId);
        /*
        if (!part || !stockItem){
          throw new Error(`Could not find part/stockItem`);
        }
        */
        // Fallbacks in case data is missing
        return {
          ...(part || {}), // will be undefined if not found, be cautious
          stockLocationId,
          stockName: stockItem?.name ?? 'Unknown Location',
          available_stock: stockItem?.available_stock ?? 0,
          isPartMissing: !part,
          isStockMissing: !stockItem,
        };
      });

      // Step 3: Update state
      setMyParts(mergedData);



    } catch (error) {
      console.error('Error fetching parts:', error.message);
    } finally {
      setLoading(false); // Set loading to false once fetching is complete
    }
  };

  useEffect(() => {
    loadApiUrl();
  }, []); // runs only once when the component mounts

  // Effect to fetch parts when API URL is loaded
  useEffect(() => {
    if (apiUrl) {
      fetchMyParts();
    }
  }, [apiUrl]); // runs when apiUrl changes

  useFocusEffect(
    useCallback(() => {
    // runs every time the screen is focused
    fetchMyParts();

    }, [apiUrl]) // dependencies
  );
  console.log('myParts:', myParts);
  // Return MyPartCards with header
  return (
  <>
    <ScrollView style={{ flex: 1 }}>

      {loading ? (
        <ActivityIndicator size="large" color="#A1E8C5" style={styles.loader} />
      ) : (
        <View style={styles.listContainer}>
          {myParts.length > 0 ? (
            <View>
              {myParts.map((part) => {
                const key = `${part.pk}-${part.stockLocationId}`;
                //console.log("Rendering part with key:", key);

                return (
                  <View key={key}>
                    {part.isPartMissing || part.isStockMissing ? (
                      <Text style={{ color: 'red' }}>
                        Incomplete data for this part.
                      </Text>
                    ) : (
                      <MyPartCard
                        key={key}
                        name={part.name}
                        stock={part.available_stock}
                        stockName={part.stockName}
                        image={part.image ? `${apiUrl}${part.image}` : null}
                        selectionMode={selectionMode}
                        isSelected={selectedParts.has(part.stockLocationId)}
                        onLongPress={() => setSelectionMode(true)}
                        onSelectToggle={() => {
                          const updated = new Set(selectedParts);
                          console.log('Selected Parts', selectedParts);
                          if (updated.has(part.stockLocationId)) {
                            updated.delete(part.stockLocationId);
                          } else {
                            updated.add(part.stockLocationId);
                          }
                          setSelectedParts(updated);
                          console.log('New Selected Parts', updated);
                        }}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <ThemedText style={styles.empty}>No parts selected.</ThemedText>
          )}

        </View>
      )}
    </ScrollView>
    <>
    {selectionMode  && (
      <View style={[
              styles.selectionBar,{
                backgroundColor: colorScheme === 'dark' ? '#1e1e1e' : '#fff',
                borderTopColor: colorScheme === 'dark' ? '#444' : '#ccc',
              }]}>
        {/* Remove parts button */}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={handleRemoveSelected}
        >
          <Text style={styles.buttonText}>Remove Selected</Text>
        </TouchableOpacity>

        {/* Cancel button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
          setSelectionMode(false);
          setSelectedParts(new Set());
          }}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>

      </View>
    )}
    </>
    </>

  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loader: {
    marginTop: 20,
  },
  listContainer: {
    padding: 16,
  },
  empty: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#999',
  },
  card: {
    margin: 10,
    padding: 10,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: "#fff",
  },
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f2f2f2',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  removeButton: {
    backgroundColor: '#f44336',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  removeButton: {
      backgroundColor: '#f44336',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 6,
      marginRight: 10,
  },
  cancelButton: {
      backgroundColor: '#32cd32',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 6,
      marginRight: 10,
  },


});


export default MyPartsScreen;