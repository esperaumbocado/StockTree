import React, { useState } from "react";
import { View, Text, StyleSheet, useColorScheme, Pressable, Alert, Modal, FlatList, TouchableOpacity } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { Card } from "react-native-paper";
import ImageCard from './ImageCard';
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchStockItemsForPart, getMyLists, addPartToList } from '@/utils/utils';
import DropDownPicker from 'react-native-dropdown-picker';

const PartCard = ({name, stock, image, partId, apiUrl, token, from}) => {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [showAddConfigModal, setShowAddConfigModal] = useState(false);
  const [locationOptions, setLocationOptions] = useState([]);
  const [openListPicker, setOpenListPicker] = useState(false);
  const [openLocationPicker, setOpenLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedListId, setSelectedListId] = useState("");
  const [lists, setLists] = useState([]);


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
      pathname: `/(tabs)/${from}/partDetail/${partId}`,
      params: { partName: name},
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
            <View style={styles.cardInfo}>

                <Text style={[styles.title, { color: colorScheme === 'dark' ? '#fff' : '#333' }]}>
                  {name}
                </Text>
                <Text style={[styles.details, { color: colorScheme === 'dark' ? '#ddd' : '#333' }]}>
                  In stock: {stock}
                </Text>
            </View>
            <ImageCard imageLink={image} token={token} />

            {/* Add button lives *inside* card but isn't wrapped by outer pressable */}

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

    {/* Modal for choosing stock location and list */}
    <Modal
      visible={showAddConfigModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowAddConfigModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Location Picker */}
          <Text style={styles.modalTitle}>Select a Location</Text>
                <DropDownPicker
                  open={openLocationPicker}
                  value={selectedLocation?.pk?.toString() || null}
                  items={locationOptions.map(loc => ({
                    label: loc.location_name,
                    value: loc.pk.toString()
                  }))}
                  setOpen={setOpenLocationPicker}
                  setValue={(val) => {
                    const locObj = locationOptions.find(l => l.pk.toString() === val());
                    setSelectedLocation(locObj || null);
                  }}
                  placeholder="Choose a location..."
                  style={{
                    borderColor: '#ccc',
                    borderRadius: 6,
                    marginBottom: 16,
                  }}
                  dropDownContainerStyle={{
                    borderColor: '#ccc',
                  }}
                  zIndex={3000}
                  zIndexInverse={1000}
                />

          {/* List Picker (Dropdown) */}
          <Text style={styles.modalTitle}>Select a List</Text>
          <DropDownPicker
            open={openListPicker}
            value={selectedListId}
            items={lists.map((list) => ({ label: list.name, value: list.id.toString() }))}
            setOpen={setOpenListPicker}
            setValue={setSelectedListId}
            setItems={() => {}} // No need to modify items dynamically
            placeholder="Choose a list..."
            style={{
              borderColor: '#ccc',
              borderRadius: 6,
              marginBottom: 16,
            }}
            dropDownContainerStyle={{
              borderColor: '#ccc',
            }}
            zIndex={1000}
            zIndexInverse={3000}
          />


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
  cardInfo: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'flex-start', // allows multi-line alignment at top
    justifyContent: 'flex-start',
    paddingBottom: 12,
    flexWrap: 'wrap',         // allow items to wrap to new lines
    gap: 8,
    maxWidth: '90%',
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
    backgroundColor: '#00a481',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignSelf: 'stretch',        // This will allow it to grow
    width: '100%',               // Ensures it takes the full width of the parent
    justifyContent: 'center',    // Center the text horizontally
    alignItems: 'center',        // Center the text vertically
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

    alignItems: 'center',
    backgroundColor: '#8B0000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,

  },
  modalCancelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalConfirmButton: {
    backgroundColor: '#00a481',
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