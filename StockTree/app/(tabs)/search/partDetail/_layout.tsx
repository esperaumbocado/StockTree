import { Stack, router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, TouchableOpacity, View, StyleSheet, useColorScheme } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PartDetailLayout() {
  const colorScheme = useColorScheme();
  const backIcon = Platform.OS === "ios" ? "chevron-back" : "arrow-back-sharp";


  const handleBackPress = () => {
    console.log("Back button pressed");
    router.back();
  };



  return (
    <SafeAreaView style={{ flex: 1 }} edges={[]}>
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
          }}
        />
      </Stack>
    </SafeAreaView>
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
