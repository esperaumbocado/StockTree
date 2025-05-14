import React, { useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, Pressable, Modal, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MyListCardProps {
  id: number;
  title: string;
  itemCount?: number;
  onPress: () => void;
}

const MyListCard: React.FC<MyListCardProps> = ({ id, title, itemCount, onPress }) => {
  const colorScheme = useColorScheme();
  const [modalVisible, setModalVisible] = useState(false);
  const textColor = colorScheme === 'dark' ? '#fff' : '#000';
  const deleteColor = colorScheme === 'dark' ? '#ff6b6b' : '#d32f2f';
  const MY_LISTS_KEY = 'MY_LISTS';
  const deleteList = async () => {
    try {
      const stored = await AsyncStorage.getItem(MY_LISTS_KEY);
      const lists = stored ? JSON.parse(stored) : [];

      const foundList = lists.find((list) => list.id === id);

      if (!foundList) {
        Alert.alert("Not Found", "The requested list could not be found.");
      }
      const updatedLists = lists.filter((list: any) => list.id !== id);
      await AsyncStorage.setItem(MY_LISTS_KEY, JSON.stringify(updatedLists));
      Alert.alert("Deleted", "The list was deleted successfully.");


    } catch (err) {
      console.error("Failed to retrieve list:", err);
      Alert.alert("Error", "Could not load the list.");

    }
  };

  return (
    <>
        <Pressable onPress={onPress}>
          {({ pressed }) => (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colorScheme === 'dark' ? '#333' : '#fff',
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
                <View style={styles.headerRow}>
                  <Text
                    style={[
                      styles.title,
                      { color: colorScheme === 'dark' ? '#fff' : '#000' },
                    ]}
                  >
                    {title}
                  </Text>
                  <View style={styles.iconContainer}>
                    <TouchableOpacity
                      onPress={() => setModalVisible(true)}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash-outline" size={20} color={deleteColor} />
                    </TouchableOpacity>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colorScheme === 'dark' ? '#ccc' : '#666'}
                    />
                  </View>
</View>

              {itemCount !== undefined && (
                <Text
                  style={[
                    styles.itemCount,
                    { color: colorScheme === 'dark' ? '#888' : '#777' },
                  ]}
                >
                  {itemCount} items
                </Text>
              )}
            </View>
          )}
        </Pressable>
        {/* Confirmation Modal */}
        <Modal
            transparent
            animationType="fade"
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: colorScheme === 'dark' ? '#222' : '#fff' }]}>
                <Text style={[styles.modalText, { color: textColor }]}>
                  Are you sure you want to delete this list?
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: deleteColor }]}
                    onPress={() => {
                      deleteList();
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#aaa' }]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
        </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    padding: 16,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  itemCount: {
    fontSize: 13,
    marginTop: 8,
  },
    deleteButton: {
      marginHorizontal: 8,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '80%',
      padding: 20,
      borderRadius: 12,
      alignItems: 'center',
    },
    modalText: {
      fontSize: 16,
      marginBottom: 20,
      textAlign: 'center',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
    },
    modalButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 6,
      marginHorizontal: 10,
    },
    modalButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    iconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8, // or use marginLeft in deleteButton if 'gap' isn't supported in your React Native version
    },
    deleteButton: {
      padding: 4,
    },

});

export default MyListCard;
