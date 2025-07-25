import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, TouchableOpacity, View, StyleSheet, useColorScheme} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PartDetailLayout() {
  const colorScheme = useColorScheme(); // Get the current color scheme (light/dark)
  const backIcon = Platform.OS === "ios" ? "chevron-back" : "arrow-back-sharp";

  const handleBackPress = () => {
    console.log("Back button pressed");
    router.back();//router.push("/myLists");
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <Stack
        screenOptions={{

          headerShown: true,

          headerTintColor: colorScheme === "dark" ? "white" : "black",

          headerTitleStyle: { fontWeight: "bold" },
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen
          name="page"
          options={{
            title: "List Details",
            headerLeft: () => (
              <View style={styles.headerLeftContainer}>
                <TouchableOpacity
                  onPress={handleBackPress}
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
    padding: 0,
    marginLeft: -10,
    marginRight: 10,
  },
  backButton: {
    padding: 10,
  },
});
