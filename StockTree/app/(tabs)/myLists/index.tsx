import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Text, Modal, TextInput, Alert, useColorScheme} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import MyListCard from '@/components/MyListCard';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function MyListsScreen() {
  const [lists, setLists] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newListName, setNewListName] = useState('');
  const router = useRouter();
  const colorScheme = useColorScheme();

  const STORAGE_KEY = 'MY_LISTS';

  useFocusEffect(
    useCallback(() => {
      loadLists();
    }, [])
  );


  const loadLists = async () => {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json) setLists(JSON.parse(json));
  };

  const saveLists = async (updatedLists) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLists));
    setLists(updatedLists);
  };

  const handleCreateList = () => {
    const trimmedName = newListName.trim();

    if (!trimmedName) {
      Alert.alert('List name required');
      return;
    }

    if (lists.some((list) => list.name.toLowerCase() === trimmedName.toLowerCase())) {
      Alert.alert('List with that name already exists');
      return;
    }

    const newList = {
      id: Date.now().toString(),
      name: trimmedName,
      items: [],
    };

    const updated = [...lists, newList];
    saveLists(updated);
    setNewListName('');
    setModalVisible(false);
  };
  const handlePress = (listId) => {
    console.log("listId");
    console.log(listId);
    router.replace({
      pathname: `/myListDetails/${listId}`,  // Ensure it's a string
    });


  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {lists.length === 0 ? (
          <Text style={styles.empty}>
            You have no lists
          </Text>
        ) : (
          lists.map((list) => (
            <MyListCard
              key={list.id}
              id={list.id}
              title={list.name}
              itemCount={list.items.length}
              onPress={() => handlePress(list.id)}
            />
          ))
        )}

      </ScrollView>

      {/* FAB */}
      <Pressable style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={28} color="white" />
      </Pressable>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colorScheme === 'dark' ? '#ddd' : 'white' }]}>
            <Text style={styles.modalTitle}>New List</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter list name"
              placeholderTextColor="#888"
              value={newListName}
              onChangeText={setNewListName}
            />
            <View style={styles.modalButtons}>
              <Pressable style={styles.modalButton} onPress={handleCreateList}>
                <Text style={styles.modalButtonText}>Create</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setNewListName('');
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 100 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#00a481',
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#00000088',
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: 'black',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    backgroundColor: '#00a481',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cancelButton: {
    backgroundColor: '#aaa',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontSize: 16,
  },
});

