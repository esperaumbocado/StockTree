import React, { useState } from "react";
import { View, Text, StyleSheet, useColorScheme, Pressable, Alert, Modal, FlatList, TouchableOpacity } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { Card } from "react-native-paper";
import ImageCard from './ImageCard';
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchStockItemsForPart, addPart, getMyLists, addPartToList } from '@/utils/utils';

const PartCard = ({name, stock, image, partId, apiUrl, token}) => {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showAddConfigModal, setShowAddConfigModal] = useState(false);
  const [locationOptions, setLocationOptions] = useState([]);
  //const [listOptions, setListOptions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedListId, setSelectedListId] = useState("");
  const [lists, setLists] = useState([]);


  console.log('PartCard apiUrl:', apiUrl);
  console.log('PartCard token:', token);

  const SELECTED_PARTS_KEY = "selected_parts";

  // HANDLE ADDING PART
  const handleAddPart = async () => {
    try {
        const stockItems = await fetchStockItemsForPart(partId, apiUrl, token);
        // Error, no stock locations found for part
        if ( !stockItems || stockItems.length < 1){
          Alert.alert("Not found", "No locations associated with this part were found.");
          return;
        }
        // only one location found
        else if (stockItems.length === 1){
            await addPart(partId, stockItems[0].pk, SELECTED_PARTS_KEY);
            return;
        }
        else{
        // Show modal with location options
            setLocationOptions(stockItems);
            setShowLocationModal(true);
        }
    } catch (err) {
        console.error("Error in handleAddPart:", err);
        Alert.alert("Error", "Something went wrong while adding the part.");
    }

  };

  const handleAddPartToList = async () => {
      try {
          const stockItems = await fetchStockItemsForPart(partId, apiUrl, token);
          const myLists = await getMyLists();
          // Error, no stock locations found for part
          if (stockItems.length < 1){
            Alert.alert("Not found", "No locations associated with this part were found.");
            return;
          }
          else if (myLists.length < 1){
            Alert.alert("You have no lists at the moment.");
            return;
          }



          else{
          // Show modal with configuration options
              console.log("MyLists: ");
              console.log(myLists);
              setLocationOptions(stockItems);
              setLists(myLists);
              setShowAddConfigModal(true);

          }
      } catch (err) {
          console.error("Error in handleAddPartToList:", err);
          Alert.alert("Error", "Something went wrong while fetching configurations to add the part to a list.");
      }

    };


  // GO TO DETAILS PAGE
  const navigateToDetails = () => {
    router.push({
      pathname: `/partDetail/${partId}`,
      params: { partName: name },
    });
  };

  return (
    <>
    <View style={styles.cardContainer}>

        {partId && name && stock != null ? (
          <Pressable
            onPress={navigateToDetails}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: colorScheme === 'dark' ? '#333' : '#fff',
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Text style={[styles.title, { color: colorScheme === 'dark' ? '#fff' : '#333' }]}>
              {name}
            </Text>
            <Text style={[styles.details, { color: colorScheme === 'dark' ? '#ddd' : '#333' }]}>
              In stock: {stock}
            </Text>
            <ImageCard imageLink={image} token={token} />

            {/* Add button lives *inside* card but isn't wrapped by outer pressable */}
            <TouchableOpacity
              onPress={handleAddPart}
              activeOpacity={0.5}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>

            {/* Add part to a list button */}
            <TouchableOpacity
              onPress={handleAddPartToList}
              activeOpacity={0.5}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>Add to a list</Text>
            </TouchableOpacity>
          </Pressable>
        ) : (
          <Text style={[styles.warningText, { color: 'red', margin: 10 }]}>
            Part information incomplete
          </Text>
        )}

    </View>
    {/* Modal for choosing stock location */}
    <Modal
      visible={showLocationModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowLocationModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select a Location</Text>
          <FlatList
            data={locationOptions}
            keyExtractor={(item) => item.pk.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={async () => {
                  await addPart(partId, item.pk, SELECTED_PARTS_KEY);
                  setShowLocationModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{item.location_name}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.modalCancelButton}
            onPress={() => setShowLocationModal(false)}
          >
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>

    {/* Modal for choosing stock location and list */}
    <Modal
      visible={showAddConfigModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowAddConfigModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select a Location</Text>

          {/* Location Picker */}
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedLocation?.pk?.toString() || ""}
              onValueChange={(itemValue) => {
                const location = locationOptions.find(loc => loc.pk.toString() === itemValue);
                setSelectedLocation(location || null);
              }}
            >
              <Picker.Item label="Choose a location..." value="" enabled={false} />
              {locationOptions.map((loc) => (
                <Picker.Item key={loc.pk} label={loc.location_name} value={loc.pk.toString()} />
              ))}
            </Picker>
          </View>

          {/* List Picker */}
          <Text style={styles.modalTitle}>Select a List</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedListId?.toString() || ""}
              onValueChange={(itemValue) => setSelectedListId(itemValue)}
            >
              <Picker.Item label="Choose a list..." value="" enabled={false} />
              {lists.map((list) => (
                <Picker.Item label={list.name} value={list.id.toString()} key={list.id} />
              ))}
            </Picker>
          </View>

          {/* Confirm / Cancel Buttons */}
          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={() => setShowAddConfigModal(false)} style={styles.modalCancelButton}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                const selectedList = lists.find((l) => l.id.toString() === selectedListId);
                if (selectedLocation && selectedList) {
                  await addPartToList(partId, selectedLocation.pk, selectedList.id);
                  setSelectedLocation(null);
                  setSelectedListId(null);
                  setShowAddConfigModal(false);
                } else {
                  Alert.alert("Selection Incomplete", "Please select both a location and a list.");
                }
              }}
              style={styles.modalConfirmButton}
            >
              <Text style={styles.modalConfirmText}>Add Part</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>


    </>
  );
};

const styles = StyleSheet.create({


  cardContainer: {
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  card: {
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  details: {
    fontSize: 16,
  },
  addButton: {
    marginTop: 12,
    backgroundColor: '#1D3557',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  image: {
      width: 100,
      height: 100,
      marginTop: 10,
      borderRadius: 8,
  },
  noImage: {
      fontSize: 14,
      color: "#black",
      marginTop: 5,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalItemText: {
    fontSize: 16,
  },
  modalCancelButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 16,
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 16,
    overflow: 'hidden',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalConfirmButton: {
    backgroundColor: '#1D3557',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  modalConfirmText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },



});

export { PartCard };