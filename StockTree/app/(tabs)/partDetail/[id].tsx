import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, ScrollView, ActivityIndicator, Platform, TouchableOpacity, Modal } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImageCard from '@/components/ImageCard';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function DetailsScreen() {
  const { id, partName } = useLocalSearchParams(); // Get part ID and name from params
  const colorScheme = useColorScheme();
  const [part, setPart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiUrl, setApiUrl] = useState('');
  const [counter, setCounter] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadApiUrl = async () => {
      try {
        const storedUrl = Platform.OS === 'web'
          ? await AsyncStorage.getItem('API_URL')
          : await SecureStore.getItemAsync('API_URL');

        if (storedUrl) {
          setApiUrl(storedUrl);
        } else {
          console.error('API URL not found in storage.');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading API URL:', error.message);
        setLoading(false);
      }
    };
    loadApiUrl();
  }, []);

  useEffect(() => {
    if (!apiUrl) return;

    const fetchPart = async () => {
      try {
        setLoading(true);
        const apiEndpoint = `${apiUrl}/api/part/${id}/`;

        const response = await fetch(apiEndpoint, {
          method: 'GET',
          headers: {
            Authorization: 'Token inv-8424bedbeceb27da942439fff71390388e87f3fe-20250321',
            Accept: 'application/json',
            Connection: 'keep-alive',
            Host: 'inventree.localhost',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        const fetchedPart = {
          id: data.pk,
          name: data.name,
          description: data.description,
          stock: data.in_stock,
          image: data.image ? `${apiUrl}${data.image}` : null,
        };

        setPart(fetchedPart);
      } catch (error) {
        console.error('Error fetching part:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPart();
  }, [apiUrl, id]);

  return (
    <ScrollView style={{ flex: 1 }}>
      <ThemedView style={[styles.headerContainer, { backgroundColor: '#A1E8C5' }]}>
        <ThemedText type="title" style={[styles.headerText, { color: colorScheme === 'dark' ? '#fff' : '#1D3D47' }]}>
          {partName}
        </ThemedText>
      </ThemedView>

      {loading ? (
        <ActivityIndicator size="large" color="#A1E8C5" style={styles.loader} />
      ) : (
        <View style={styles.partContainer}>
          {part ? (
            <>
              <Text style={[styles.infoText, { color: colorScheme === 'dark' ? '#fff' : '#1D3D47' }]}>
                Description: {part.description}
              </Text>
              <Text style={[styles.infoText, { color: colorScheme === 'dark' ? '#fff' : '#1D3D47' }]}>
                Stock: {part.stock}
              </Text>
              <ImageCard
                imageLink={part.image}
                token="inv-8424bedbeceb27da942439fff71390388e87f3fe-20250321"
              />

              {/* COUNTER BUTTON HERE */}
              <TouchableOpacity style={styles.counterButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.counterButtonText}>Open Counter</Text>
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
                    <Text style={styles.infoText}>
                                    Stock: {part.stock}
                                  </Text>
                    <View style={styles.buttonRow}>
                      <TouchableOpacity // Increase counter
                        style={styles.modalButton}
                        onPress={() => setCounter((counter >= part.stock ? part.stock : counter+1))}
                      >
                        <Text style={styles.buttonText}>+</Text>
                      </TouchableOpacity>

                      <TouchableOpacity // Decrease couunter
                        style={styles.modalButton}
                        onPress={() => setCounter((counter > 0 ? counter - 1 : 0))}
                      >
                        <Text style={styles.buttonText}>-</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={[styles.modalButton, styles.closeButton]}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

            </>
          ) : (
            <ThemedText style={styles.noResults}>No part found.</ThemedText>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
  },
  partContainer: {
    padding: 16,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  counterButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  counterButtonText: {
    color: "white",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 250,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  counterText: {
    fontSize: 20,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    margin: 5,
    borderRadius: 8,
    width: 60,
    alignItems: "center",
  },
  closeButton: {
    backgroundColor: "red",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});

export default DetailsScreen;
