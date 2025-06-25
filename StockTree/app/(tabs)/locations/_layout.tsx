import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import React from 'react';

export default function LocationsLayout() {
  const colorScheme = useColorScheme();

  return (

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
            title: 'Locations',

          }}
        />
      </Stack>
  );
}
