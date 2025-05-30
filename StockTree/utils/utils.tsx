import AsyncStorage from "@react-native-async-storage/async-storage";
import {Alert } from "react-native";

  export const fetchStockItemsForPart = async(partId, apiUrl) => {
        try {
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

  // Store part info
  export const addPart = async (partId, stockLocationId, SELECTED_PARTS_KEY) => {
    console.log('stockLocationId: ', stockLocationId);
    try {
      //await AsyncStorage.setItem(SELECTED_PARTS_KEY, JSON.stringify([]));
      const stored = await AsyncStorage.getItem(SELECTED_PARTS_KEY);
      const now = Date.now();

      let current = stored ? JSON.parse(stored) : [];

      // Remove expired
      //current = current.filter(item => now - item.timestamp < 86400000);

      const alreadyAdded = current.some(item =>  item.partId === partId && item.stockLocationId === stockLocationId);
      if (alreadyAdded) {
        Alert.alert("Already added", "This part is already selected.");
        return;
      }

      current.push({
        partId,
        timestamp: now,
        stockLocationId,

      });
      console.log("Selected Parts (about to be saved):", current);
      await AsyncStorage.setItem(SELECTED_PARTS_KEY, JSON.stringify(current));
      Alert.alert("Success", "Part added to selected parts");
    } catch (err) {
      console.error("Add failed:", err);
      Alert.alert("Error", "Could not add part.");
    }
  };

  // Update the stock of the stockItem
  export const handleRemoveStock = async (apiUrl: string, counter: number, stockItemId: integer, refreshData: ()=> void) => {
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