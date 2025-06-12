import AsyncStorage from "@react-native-async-storage/async-storage";
import {Alert, Platform } from "react-native";
import * as SecureStore from 'expo-secure-store';

  export const fetchStockItemsForPart = async(partId, apiUrl, token) => {
        if(!apiUrl || !token) return;
        try {
            const params = new URLSearchParams();
            params.append('part', partId);
            const apiEndpoint = `${apiUrl}/api/stock/?${params.toString()}`;

            const response = await fetch(apiEndpoint, {
                method: 'GET',
                headers: {
                  'Authorization': `Token ${token}`,
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
            console.log('stock locations :', data);
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
            return fetchedStockItems;
        } catch (error) {
            console.error('Error retrieving stock of part:', error.message);
            return [];
          } finally {
          //
          }

  };

  export const getMyLists = async() => {
          const MY_LISTS_KEY = 'MY_LISTS';
          let current = [];
          try {
                //await AsyncStorage.setItem(SELECTED_PARTS_KEY, JSON.stringify([]));
                const stored = await AsyncStorage.getItem(MY_LISTS_KEY);


                current = stored ? JSON.parse(stored) : [];


          } catch (err) {
                console.error("Add failed:", err);
                Alert.alert("Error", "Could not find any lists.");

          } finally{
            return current;
          }


  };

  // Store part info

  export const addPartToList = async (partId, stockLocationId, listId) => {
    const MY_LISTS_KEY = 'MY_LISTS';
    try {


      // Get stored lists
      const stored = await AsyncStorage.getItem(MY_LISTS_KEY);
      const lists = stored ? JSON.parse(stored) : [];

      // Find the specific list by ID
      const targetListIndex = lists.findIndex(list => list.id === listId);
      if (targetListIndex === -1) {
        Alert.alert("List Not Found", "The selected list does not exist.");
        return;
      }

      const targetList = lists[targetListIndex];

      // Check if the part already exists in this list
      const alreadyAdded = targetList.items.some(
        item => item.partId === partId && item.stockLocationId === stockLocationId
      );

      if (alreadyAdded) {
        Alert.alert("Already Added", "This part already exists in the selected list.");
        return;
      }

      // Add the new part to the list
      targetList.items.push({
        partId,
        stockLocationId,

      });

      // Update and save all lists
      lists[targetListIndex] = targetList;
      await AsyncStorage.setItem(MY_LISTS_KEY, JSON.stringify(lists));

      Alert.alert("Success", "Part added to the list.");
    } catch (err) {
      console.error("Add to list failed:", err);
      Alert.alert("Error", "Could not add part to the list.");
    }
  };


  // Update the stock of the stockItem
  export const handleRemoveStock = async (apiUrl: string, counter: number, stockItemId: integer, refreshData: ()=> void, token) => {
    try {
      const response = await fetch(`${apiUrl}/api/stock/remove/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              pk: stockItemId,  // StockItem ID
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


  // LOAD TOKEN
  export  const loadToken = async () => {
      try {
        let storedToken;
        if (Platform.OS === 'web') {
          storedToken = await AsyncStorage.getItem('TOKEN');
        } else {
          storedToken = await SecureStore.getItemAsync('TOKEN');
        }

        if (storedToken) {

          console.log('TOKEN:', storedToken);
          return( storedToken);
        }
      } catch (error) {
        console.error('Error loading TOKEN:', error);
      }
      return null;
    };