import React, { useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, Pressable, TouchableOpacity, Modal } from "react-native";
import { Card } from "react-native-paper";
import {ThemedText} from '@/components/ThemedText';
import ImageCard from "./ImageCard";
import { handleRemoveStock } from '@/utils/utils';
const MyPartCard = ({
  name,
  stock,
  stockLocationId,
  stockName,
  image,
  selectionMode = false,
  isSelected = false,
  onLongPress,
  onSelectToggle,
  apiUrl,
  refreshData,
  isUnavailable = false,
  token,
}) => {
  const colorScheme = useColorScheme();

  const backgroundColor = colorScheme === "dark" ? "#333" : "#fff";
  const textColor = colorScheme === "dark" ? "#fff" : "#333";
  const detailsColor = colorScheme === "dark" ? "#ddd" : "#333";
  const selectedHighlight = isSelected ? "#f44336" : backgroundColor;

  const [counter, setCounter] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  // Locate with WLed
  const toggleWLED = async () => {
    console.log('CONNECTING TO WLED... NOT IMPLEMENTED');
  };

  return (

    <Pressable
      onLongPress={onLongPress}
      onPress={selectionMode ? onSelectToggle : undefined}
      style={[styles.cardContainer, { backgroundColor: selectedHighlight }]}
    >
      {isUnavailable ? (

      <View style={[styles.card, styles.unavailableCard]}>
        <Text style={[styles.unavailableText, { color: textColor }]}>Part not available</Text>
        <Text style={[styles.details, { color: textColor, fontStyle: 'italic' }]}>
          This part could not be found or may have been removed.
        </Text>
        {selectionMode && (
          <Text style={[styles.selectHint, { color: isSelected ? "#00796b" : "#888" }]}>
            {isSelected ? "✓ Selected" : "Tap to select"}
          </Text>
        )}
      </View>

      ) : (

      <View style={[styles.card]}>
        <ImageCard imageLink={image} token={token} />
        <Text style={[styles.title, { color: textColor }]}>{name}</Text>
        <Text style={[styles.details, { color: detailsColor }]}>{stockName}</Text>
        <Text style={[styles.details, { color: detailsColor }]}>{stock} in stock </Text>
        {selectionMode && (
          <Text style={[styles.selectHint, { color: isSelected ? "#00796b" : "#888" }]}>
            {isSelected ? "✓ Selected" : "Tap to select"}
          </Text>
        )}
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
              <Text style={styles.infoText}>Stock: {stock}</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setCounter(counter >= stock ? stock : counter + 1)}
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
                  handleRemoveStock(apiUrl, counter, stockLocationId, refreshData, token); // Assuming handleSubmit expects the counter value
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


      )}

    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 0,
    marginBottom: 0,
    borderBottomWidth: 2,
    borderBottomColor: "#ccc",
  },
  card: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },
  details: {
    fontSize: 16,
    marginTop: 5,
    marginBottom: 1,
  },
  selectHint: {
    fontSize: 14,
    fontStyle: "italic",
  },
  button: {
    backgroundColor: '#00a481', // A cooler and lighter green shade
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
  unavailableCard: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },

  unavailableText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },

});

export { MyPartCard };
