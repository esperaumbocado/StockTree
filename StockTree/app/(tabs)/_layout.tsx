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

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
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
          },
          default: {},
        }),
    }}>
    <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
    />
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
      name="categoryDetail"
      options={{
        title: 'Category Detail',
        href: null,
        tabBarIcon: ({ color }) => <FontAwesome name="gear" size={28} color={color} />,
      }}
    />
    <Tabs.Screen
      name="partDetail"
      options={{
        title: 'Part Detail',
        href: null,
        tabBarIcon: ({ color }) => <FontAwesome name="gear" size={28} color={color} />,
      }}
    />
    <Tabs.Screen
      name="myListDetails"
      options={{
        href: null, // hides it from the tab bar
      }}
    />
    <Tabs.Screen
      name="myPartsList"
      options={{
        href: null, // hides it from the tab bar
      }}
    />

        </Tabs>

  );
}
