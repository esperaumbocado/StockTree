import React from 'react';
import { View, Text, StyleSheet, useColorScheme, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MyListCardProps {
  title: string;
  itemCount?: number;
  onPress: () => void;
}

const MyListCard: React.FC<MyListCardProps> = ({ title, itemCount, onPress }) => {
  const colorScheme = useColorScheme();

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View
          style={[
            styles.card,
            {
              backgroundColor: colorScheme === 'dark' ? '#333' : '#fff',
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <View style={styles.headerRow}>
            <Text
              style={[
                styles.title,
                { color: colorScheme === 'dark' ? '#fff' : '#000' },
              ]}
            >
              {title}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colorScheme === 'dark' ? '#ccc' : '#666'}
            />
          </View>
          {itemCount !== undefined && (
            <Text
              style={[
                styles.itemCount,
                { color: colorScheme === 'dark' ? '#888' : '#777' },
              ]}
            >
              {itemCount} items
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    padding: 16,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  itemCount: {
    fontSize: 13,
    marginTop: 8,
  },
});

export default MyListCard;
