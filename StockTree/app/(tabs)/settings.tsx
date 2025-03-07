import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function SettingsScreen() {
  const [apiUrl, setApiUrl] = useState('');

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

  return (
    <View style={styles.container}>
      <Text style={styles.label}>API URL:</Text>
      <TextInput
        style={styles.input}
        value={apiUrl}
        onChangeText={setApiUrl}
        placeholder="Enter API URL"
        autoCapitalize="none"
      />
      <Button title="Save" onPress={saveApiUrl} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
  },
});