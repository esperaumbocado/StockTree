import { Stack } from 'expo-router';
import React from 'react';

export default function CategoriesLayout() {

  return (

      <Stack initialRouteName="index"
        screenOptions={{
          headerShown: false,
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen
          name="index"

          options={{
            title: 'Search',

          }}
        />
      </Stack>
  );
}
