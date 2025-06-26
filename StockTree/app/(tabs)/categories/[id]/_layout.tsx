import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, TouchableOpacity, View, StyleSheet, useColorScheme} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";

export default function CategoryDetailLayout() {
  const colorScheme = useColorScheme(); // Get the current color scheme (light/dark)
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
          headerTintColor: colorScheme === "dark" ? "white" : "black", // Dynamic text color based on theme
          headerStyle: {
            backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "white"
          },
          headerTitleStyle: { fontWeight: "bold" },
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen
          name="page"
          options={{
            title: "Category Details",
            headerLeft: () => (
              <View style={styles.headerLeftContainer}>
                <TouchableOpacity
                  onPressIn={handleBackPress}
                  style={styles.backButton}
                >
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
