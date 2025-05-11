import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { ActivityIndicator, ScrollView, View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';

import { useFocusEffect } from '@react-navigation/native';
import { MyPartCard } from '@/components/MyPartCard';
import {ThemedText} from '@/components/ThemedText'; // Adjust path



export default function MyListParts(){
    const { id: listId } = useLocalSearchParams();

    const [apiUrl, setApiUrl] = useState('');
    const [myList, setMyList] = useState(null);
    const [myParts, setMyParts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedParts, setSelectedParts] = useState(new Set());
    const MY_LISTS_KEY = 'MY_LISTS';
    const colorScheme = useColorScheme();

    // Fetch the list based on ID
    const getListById = async (listId) => {

      try {
        const stored = await AsyncStorage.getItem(MY_LISTS_KEY);
        const lists = stored ? JSON.parse(stored) : [];

        const foundList = lists.find((list) => list.id === listId);

        if (!foundList) {
          Alert.alert("Not Found", "The requested list could not be found.");
        }

        return foundList || null;
      } catch (err) {
        console.error("Failed to retrieve list:", err);
        Alert.alert("Error", "Could not load the list.");
        return null;
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

    // Get parts from ids
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

    // Get stockItem from stockId
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


    // get partIds and StockPartIds from myList.items
    const getMyListPartIds = () => {
      const items = myList.items;
      if (!items || items.length === 0) return [];

      return items.map(item => ({
        partId: item.partId,
        stockLocationId: item.stockLocationId,
      }));
    };

    const fetchMyListParts = async () => {
        try {
            const partAssociations = getMyListPartIds();

            if (!partAssociations || partAssociations.length === 0) {
              return [];
            }

            // Extract IDs from associations
            const partIds = partAssociations.map(item => item.partId);
            const stockIds = partAssociations.map(item => item.stockLocationId);

            setLoading(true);

            const parts = await fetchMultipleParts(partIds, apiUrl, 'inv-8424bedbeceb27da942439fff71390388e87f3fe-20250321');
            const stockItems = await fetchStockItems(stockIds, apiUrl, 'inv-8424bedbeceb27da942439fff71390388e87f3fe-20250321');

            // Build lookup maps
            const partMap = new Map(parts.map(part => [part.pk, part]));
            const stockMap = new Map(stockItems.map(stock => [stock.stockId, stock]));

            // Merge data
            const mergedData = partAssociations.map(({ partId, stockLocationId }) => {
              const part = partMap.get(partId);
              const stockItem = stockMap.get(stockLocationId);

              return {
                ...(part || {}),
                stockLocationId,
                stockName: stockItem?.name ?? 'Unknown Location',
                available_stock: stockItem?.available_stock ?? 0,
                isPartMissing: !part,
                isStockMissing: !stockItem,
              };
            });

            return mergedData;
        } catch (error) {
            console.error('Error fetching list parts:', error);
            return [];
        } finally {
            setLoading(false);
        }


    };
    const setUpMyList = async() => {
        const foundList =  await getListById(listId);
        console.log("foundList:");
        console.log(foundList);
        if(!foundList){
            return;
        }
        setMyList(foundList);
        console.log('setMyList: ', myList);
    }
    const setMyListParts = async() => {
        if(!myList){return;}
        const foundParts = await fetchMyListParts();
        if(!foundParts){
            return;
        }
        setMyParts(foundParts);
    };

    const refreshData= async () => {

        await setMyListParts();
      };

    useEffect(() => {
      console.log('MyListParts mounted');

      return () => {
        console.log('MyListParts unmounted');
      };
    }, []);

    useEffect(() => {
      refreshData();
    }, [myList]); // runs when there are changes in myList

    useEffect(() => {
      setUpMyList();
    }, [apiUrl]); // runs when there are changes in myList



    useFocusEffect(
      useCallback(() => {
        const loadApiData = async () => {
                await loadApiUrl();
        };
        const loadData = async () => {await setUpMyList();};
        loadApiData();
        loadData();
      }, [])
    );

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

            console.log('current:', myList);
            const partsToStore = myList.items.filter(item => partsToStoreIds.includes(item.stockLocationId   ));
            // Create a copy of myList and update the items
            let updatedList = { ...myList, items: partsToStore };
            console.log('updatedList:', updatedList);
            // Save the updated list to AsyncStorage
            const storedLists = await AsyncStorage.getItem(MY_LISTS_KEY);
            let lists = storedLists ? JSON.parse(storedLists) : [];

            // Find the index of the list to update
            const listIndex = lists.findIndex(list => list.id === myList.id);

            if (listIndex !== -1) {
            lists[listIndex] = updatedList; // Update the list at the correct index
            await AsyncStorage.setItem(MY_LISTS_KEY, JSON.stringify(lists));
            console.log("Updated the list in storage.");
            } else {
            console.error("List not found in storage");
            }

          } catch (error) {
            console.error("Failed to update list parts:", error);
          }

          // Reset selection mode and selected parts
          setSelectionMode(false);
          setSelectedParts(new Set());
          // Reload page
          await setUpMyList();

        }
    };

    console.log("myParts");
    console.log(myParts);
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
                      console.log("Key");
                      console.log(key);
                      console.log('Rendering MyPartCard with:', {
                        key,
                        name: part.name,
                        stock: part.available_stock,
                        stockLocationId: part.stockLocationId,
                        stockName: part.stockName,
                        image: part.image ? `${apiUrl}${part.image}` : null,
                        selectionMode,
                        isSelected: selectedParts.has(part.stockLocationId),
                        apiUrl,
                      });

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
                              stockLocationId={part.stockLocationId}
                              stockName={part.stockName}
                              image={part.image ? `${apiUrl}${part.image}` : null}
                              selectionMode={selectionMode}
                              isSelected={selectedParts.has(part.stockLocationId)}
                              onLongPress={() => setSelectionMode(true)}
                              onSelectToggle={() => {
                                const updated = new Set(selectedParts);
                                if (updated.has(part.stockLocationId)) {
                                  updated.delete(part.stockLocationId);
                                } else {
                                  updated.add(part.stockLocationId);
                                }
                                setSelectedParts(updated);
                              }}
                              apiUrl={apiUrl}
                              refreshData={ refreshData}
                            />
                          )}
                        </View>
                      );
                    })}
                  </View>
              ) : (
                <ThemedText style={styles.empty}>The list is empty.</ThemedText>
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
  loader: {
    marginTop: 40,
    alignSelf: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontSize: 16,
  },
  partCardWrapper: {
    marginBottom: 12,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 8,
  },
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f8f8f8',
  },
  removeButton: {
    backgroundColor: '#ff5c5c',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: '#999',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});

//export default MyListParts;