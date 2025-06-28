import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <Tabs
        screenOptions={{
            tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
            headerShown: false,
            tabBarButton: HapticTab,
            tabBarBackground: TabBarBackground,
            tabBarStyle: Platform.select({
              ios: {
                // Use a transparent background on iOS to show the blur effect
                position: 'absolute',
                height: 60
              },
              default: {
                height: 50
              },
            }),
        }}>

    <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
    />
    <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <FontAwesome name="gear" size={28} color={color} />,
        }}
    />
    <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color }) => <FontAwesome name="th-large" size={28} color={color} />,
        }}
    />
    <Tabs.Screen
            name="locations"
            options={{
              title: 'Locations',
              tabBarIcon: ({ color }) => <FontAwesome name="map-marker" size={28} color={color} />,
            }}
        />
    <Tabs.Screen
      name="search"
      options={{
        title: 'Search',
        tabBarIcon: ({ color }) => <FontAwesome name="search" size={28} color={color} />,
      }}
    />

    <Tabs.Screen
      name="myLists"
      options={{
        title: 'My Lists',
        tabBarIcon: ({ color }) => <FontAwesome name="list" size={28} color={color} />,
      }}
    />

    <Tabs.Screen
      name="index"
      options={{
        href: null, // hides it from the tab bar
      }}
    />

        </Tabs>
    </SafeAreaView>

  );
}
