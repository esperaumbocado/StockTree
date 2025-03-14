import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function SettingsScreen() {
  const [apiUrl, setApiUrl] = useState('');
  const colorScheme = useColorScheme();  // Get the current theme (light or dark)

  // Load API URL when the screen opens
  useEffect(() => {
    const loadApiUrl = async () => {
      const storedUrl = await SecureStore.getItemAsync('API_URL');
      if (storedUrl) setApiUrl(storedUrl);
    };
    loadApiUrl();
  }, []);

  const saveApiUrl = async () => {
    try {
      await SecureStore.setItemAsync('API_URL', apiUrl);
      Alert.alert('Success', 'API URL saved!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save API URL.');
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
