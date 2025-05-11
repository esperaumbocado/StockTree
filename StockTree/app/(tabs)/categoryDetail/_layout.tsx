import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, TouchableOpacity, View, StyleSheet, useColorScheme } from "react-native";

export default function CategoryDetailLayout() {
  const colorScheme = useColorScheme(); // Get the current color scheme (light/dark)
  const backIcon = Platform.OS === "ios" ? "chevron-back" : "arrow-back-sharp";

  const handleBackPress = () => {
    console.log("Back button pressed");
    router.replace('/');
  };

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: colorScheme === "dark" ? "white" : "black", // Dynamic text color based on theme
        headerStyle: { backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "white" }, // Dynamic header background color
        headerTitleStyle: { fontWeight: "bold" },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          title: "Category Details",
          headerLeft: () => (
            <View style={styles.headerLeftContainer}>
              <TouchableOpacity
                onPressIn={handleBackPress}  // Trigger the back action on press in
                style={styles.backButton}
              >
                <Ionicons
                  name={backIcon}
                  size={25}
                  color={colorScheme === "dark" ? "white" : "black"} // Dynamic icon color based on theme
                />
              </TouchableOpacity>
            </View>
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
