import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { handleRemoveStock } from '@/utils/utils';

const StockItemCard = ({ stockItem, apiUrl, refreshData }) => {
  const [modalVisible, setModalVisible] = useState(false);
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
    <View style={styles.cardContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{stockItem.location_name}</Text>
      </View>
    {/*
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Part ID:</Text>
        <Text style={styles.value}>{stockItem.part}</Text>
      </View>
*/}
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Quantity:</Text>
        <Text style={styles.value}>{stockItem.quantity}</Text>
      </View>

      <View style={styles.detailContainer}>
        <Text style={styles.label}>Serial Number:</Text>
        <Text style={styles.value}>{stockItem.serial}</Text>
      </View>

      <View style={styles.detailContainer}>
        <Text style={styles.label}>Batch:</Text>
        <Text style={styles.value}>{stockItem.batch}</Text>
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
                handleRemoveStock(apiUrl, counter, stockItem.pk, refreshData); // Assuming handleSubmit expects the counter value
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
  cardContainer: {
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D3557', // A muted, refined blue that is not too bright
  },
  detailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  label: {
    fontSize: 14,
    color: '#6D6D6D', // Softer gray for labels
  },
  value: {
    fontSize: 14,
    color: '#1D3557', // Consistent muted blue for values
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#457B9D', // A cooler and lighter blue shade
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
    backgroundColor: '#457B9D', // Matching color to the counter button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  submitButton: {
    backgroundColor: '#1D3557', // Deep blue for the submit button
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
