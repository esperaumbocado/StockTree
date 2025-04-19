
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