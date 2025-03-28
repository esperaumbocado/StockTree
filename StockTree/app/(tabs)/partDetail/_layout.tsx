import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, TouchableOpacity, View, StyleSheet, useColorScheme, Button } from "react-native";
import React, { useState } from "react";

const WLED_IP = "http://192.168.1.100"; // Replace with your actual WLED IP

export default function PartDetailLayout() {
  const colorScheme = useColorScheme(); // Get the current color scheme (light/dark)
  const backIcon = Platform.OS === "ios" ? "chevron-back" : "arrow-back-sharp";
  const [isWledOn, setIsWledOn] = useState(false);

  const handleBackPress = () => {
    console.log("Back button pressed");
    router.back();
  };

  const toggleWLED = async () => {
    try {
      const response = await fetch(`${WLED_IP}/json/state`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ on: !isWledOn }),
      });

      if (response.ok) {
        setIsWledOn(!isWledOn);
      } else {
        console.error("Failed to toggle WLED");
      }
    } catch (error) {
      console.error("Error connecting to WLED:", error);
    }
  };

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: colorScheme === "dark" ? "white" : "black",
        headerStyle: { backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "white" },
        headerTitleStyle: { fontWeight: "bold" },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          title: "Part Details",
          headerLeft: () => (
            <View style={styles.headerLeftContainer}>
              <TouchableOpacity onPressIn={handleBackPress} style={styles.backButton}>
                <Ionicons
                  name={backIcon}
                  size={25}
                  color={colorScheme === "dark" ? "white" : "black"}
                />
              </TouchableOpacity>
            </View>
          ),
          headerRight: () => (
            <Button title={isWledOn ? "Turn Off WLED" : "Turn On WLED"} onPress={toggleWLED} />
          ),
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerLeftContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -10,
    marginRight: 10,
  },
  backButton: {
    padding: 10,
  },
});

