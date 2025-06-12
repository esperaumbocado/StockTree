// components/Button.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet, GestureResponderEvent } from "react-native";

type ButtonProps = {
  buttonText: string;
  onPress?: (event: GestureResponderEvent) => void;
  style?: object;
  textStyle?: object;
};

const Button: React.FC<ButtonProps> = ({ buttonText, onPress, style, textStyle }) => {
  return (
    <View style={[styles.container, style]}>
      <Pressable 
        onPress={onPress} 
        style={({ pressed }) => [
          styles.button, 
          pressed && styles.pressed
        ]}
      >
        <Text style={[styles.text, textStyle]}>{buttonText}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  button: {
    backgroundColor: "#404040",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#555555", 
    
    elevation: 2, // Android
    shadowColor: "#000", // iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: "#4a4a4a",
    transform: [{ scale: 0.99 }],
  },
  text: {
    color: "#E0E0E0", 
    fontSize: 21, 
    fontWeight: "500",
    letterSpacing: 0.3,
  },
});

export default Button;