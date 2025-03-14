import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, useColorScheme, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const [apiUrl, setApiUrl] = useState('');
  const colorScheme = useColorScheme();  // Get the current theme (light or dark)

  // Load API URL when the screen opens
  useEffect(() => {
    const loadApiUrl = async () => {
      const storedUrl = await getApiUrl();
      if (storedUrl) setApiUrl(storedUrl);
    };
    loadApiUrl();
  }, []);

  // Save API URL based on platform
  const saveApiUrl = async () => {
    try {
      await saveApiUrlToStorage('API_URL', apiUrl);
      Alert.alert('Success', 'API URL saved!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save API URL.');
    }
  };

  // Save API URL to storage (asyncStorage for web, secureStore for mobile)
  const saveApiUrlToStorage = async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  };

  // Get API URL from storage (asyncStorage for web, secureStore for mobile)
  const getApiUrl = async () => {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem('API_URL');
      } else {
        return await SecureStore.getItemAsync('API_URL');
      }
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  };

  // Dynamic styles based on the current theme
  const styles = getStyles(colorScheme);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>API URL:</Text>
      <TextInput
        style={styles.input}
        value={apiUrl}
        onChangeText={setApiUrl}
        placeholder="Enter API URL"
        placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#888'} // Lighter placeholder text for dark mode
        autoCapitalize="none"
      />
      <Button title="Save" onPress={saveApiUrl} />
    </View>
  );
}

// Get dynamic styles based on the theme
const getStyles = (theme: string) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff', // Dark background for dark mode
    },
    label: {
      fontSize: 18,
      marginBottom: 8,
      color: theme === 'dark' ? '#fff' : '#000', // Light text in dark mode
    },
    input: {
      borderWidth: 1,
      borderColor: theme === 'dark' ? '#fff' : '#ccc', // White border in dark mode
      padding: 10,
      borderRadius: 5,
      marginBottom: 16,
      color: theme === 'dark' ? '#fff' : '#000', // White text in input for dark mode
    },
  });
};
