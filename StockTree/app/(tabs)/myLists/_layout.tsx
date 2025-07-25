import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, TouchableOpacity, View, StyleSheet, useColorScheme } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyListsLayout() {
  const colorScheme = useColorScheme();
  const backIcon = Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back-sharp';

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <Stack initialRouteName="index"
        screenOptions={{
          headerShown: false,
          headerTintColor: colorScheme === 'dark' ? 'white' : 'black',
          headerStyle: {
            backgroundColor: colorScheme === 'dark' ? '#1E1E1E' : 'white',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'My Lists',
            headerShown: true,
            headerLeft: () => (
              <View style={styles.headerLeftContainer}>
                <Ionicons
                  name="list"
                  size={25}
                  style={styles.listButton}
                  color={colorScheme === 'dark' ? 'white' : 'black'}
                />
              </View>
            ),
          }}
        />
      </Stack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -10,
    marginRight: 10,
  },
  listButton: {
    marginLeft: 10,
    padding: 10,
  },
});
