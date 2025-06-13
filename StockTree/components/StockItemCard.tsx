import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, useColorScheme } from 'react-native';
import { addPart, handleRemoveStock } from '@/utils/utils';

const StockItemCard = ({ stockItem, apiUrl, refreshData, token }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const [counter, setCounter] = useState(0);
  const [isWledOn, setIsWledOn] = useState(false);
  const WLED_IP = "http://192.168.1.100"; // Replace with actual WLED IP
  const SELECTED_PARTS_KEY = "selected_parts";
  const toggleWLED = async () => {
    console.log('CONNECTING TO WLED... NOT IMPLEMENTED');
  /*
    try {
      const response = await fetch(`${WLED_IP}/json/state`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ on: !isWledOn }),
      });

      if (response.ok) {
        setIsWledOn(!isWledOn);
      } else {
        console.error("Failed to toggle WLED");
      }
    } catch (error) {
      console.error("Error connecting to WLED:", error);
    }
   */
  };

  return (
    <View style={colorScheme === 'dark' ? styles.cardContainerDark : styles.cardContainerLight }>
      <View style={styles.headerContainer}>
        <Text style = {colorScheme === 'dark' ? styles.titleDark : styles.titleLight}>{stockItem.location_name}</Text>
      </View>
    {/*
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Part ID:</Text>
        <Text style={styles.value}>{stockItem.part}</Text>
      </View>
*/}
      <View style={styles.detailContainer}>
        <Text style={colorScheme === 'dark' ? styles.labelDark : styles.labelLight}>Quantity:</Text>
        <Text  style={colorScheme === 'dark' ? styles.valueDark : styles.valueLight} >{stockItem.quantity}</Text>
      </View>

      <View style={styles.detailContainer}>
        <Text style = {colorScheme === 'dark' ? styles.labelDark : styles.labelLight}>Serial Number:</Text>
        <Text style={colorScheme === 'dark' ? styles.valueDark : styles.valueLight} >{stockItem.serial}</Text>
      </View>

      <View style={styles.detailContainer}>
        <Text style = {colorScheme === 'dark' ? styles.labelDark : styles.labelLight} >Batch:</Text>
        <Text style={colorScheme === 'dark' ? styles.valueDark : styles.valueLight} >{stockItem.batch}</Text>
      </View>
{/*
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Location ID:</Text>
        <Text style={styles.value}>{stockItem.location}</Text>
      </View>
*/}
{/*
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Location Name:</Text>
        <Text style={styles.value}>{stockItem.location_name}</Text>
      </View>
*/}

      {/*LOCATE WITH WLED BUTTON */}
      <TouchableOpacity style={styles.button} onPress={() => toggleWLED()}>
        <Text style={styles.buttonText}>Locate</Text>
      </TouchableOpacity>
      {/* COUNTER BUTTON */}
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Adjust Quantity</Text>
      </TouchableOpacity>

      {/* Modal for Counter */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.counterText}>Amount to take: {counter}</Text>
            <Text style={styles.infoText}>Stock: {stockItem.quantity}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setCounter(counter >= stockItem.quantity ? stockItem.quantity : counter + 1)}
              >
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setCounter(counter > 0 ? counter - 1 : 0)}
              >
                <Text style={styles.buttonText}>-</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.modalButton, styles.submitButton]}
              onPress={() => {
                handleRemoveStock(apiUrl, counter, stockItem.pk, refreshData, token); // Assuming handleSubmit expects the counter value
                setModalVisible(false); // Close the modal after submitting
              }}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.closeButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainerDark: {
    backgroundColor: '#333', // White background for the card
    padding: 15,
    borderRadius: 10,
    margin: 10,
    shadowColor: '#4a4a4a', // Slightly darker shadow for a subtle effect
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, // Reduced opacity for a softer shadow
    shadowRadius: 4,
    elevation: 3,
  },
  cardContainerLight: {
    backgroundColor: '#ffffff', // White background for the card
    padding: 15,
    borderRadius: 10,
    margin: 10,
    shadowColor: '#4a4a4a', // Slightly darker shadow for a subtle effect
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, // Reduced opacity for a softer shadow
    shadowRadius: 4,
    elevation: 3,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  titleDark: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ccc', // white for dark mode
  },
  titleLight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D3557', // a nice blue for light mode
  },
  detailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  labelLight: {
    fontSize: 14,
    color: '#6D6D6D', // Softer gray for labels
  },
  labelDark: {
    fontSize: 14,
    color: '#ccc', // Softer gray for labels
  },
  valueLight: {
    fontSize: 14,
    color: '#1D3557', // Consistent muted blue for values
    fontWeight: 'bold',
  },
  valueDark: {
    fontSize: 14,
    color: '#ccc', // Consistent muted blue for values
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#00a481', // A cooler and lighter blue shade
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff', // White text on the counter button
    fontSize: 16,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay for the modal
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#ffffff', // White background for the modal
    borderRadius: 10,
  },
  counterText: {
    fontSize: 18,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#1D3557', // Refined blue for the info text
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#666666', // Matching color to the counter button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  submitButton: {
    backgroundColor: '#00a481', // Deep blue for the submit button
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: '#D32F2F', // A subtle red for the close button
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff', // White text for button text
    textAlign: 'center',
    fontSize: 16,
  },
});


export default StockItemCard;
