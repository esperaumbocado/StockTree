import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import { Card } from "react-native-paper";
import RNFetchBlob from 'react-native-fetch-blob';  // Import RNFetchBlob to handle the Blob to Base64 conversion

const ImageCard = ({ imageLink, token }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(`${imageLink}`, {
          method: "GET",
          headers: {
            'Authorization': `Token ${token}`,  // Use dynamic token passed as a prop
            'Content-Type': 'application/json',
            'Accept': "application/json",
          },
        });

        if (response.ok) {
          const data = await response.blob();
          const base64Data = await blobToBase64(data); // Convert Blob to Base64
          setImageUrl(`data:image/jpeg;base64,${base64Data}`); // Set the image source as base64 string
        } else {
          throw new Error("Failed to fetch image.");
        }
      } catch (error) {
        setError(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [imageLink, token]);

  // Function to convert Blob to Base64 string
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]); // Get only the base64 string
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        {loading && <ActivityIndicator size="large" color="#0000ff" />}
        {error && <Text style={styles.error}>{error}</Text>}
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          !loading && <Text style={styles.noImage}>No image available</Text>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 10,
    padding: 10,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: "#fff",
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  noImage: {
    fontSize: 14,
    color: "gray",
    marginTop: 10,
  },
  error: {
    fontSize: 14,
    color: "red",
    marginTop: 10,
  },
});

export default ImageCard;
