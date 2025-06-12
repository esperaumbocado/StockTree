import { StyleSheet, View, Modal } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import Button from '@/components/ui/Button';


export default function TabTwoScreen() {
  const [modalIsVisible, setModalVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const qrCodeLock = useRef(false);
  const router = useRouter();


  async function handleOpenCamera() {
    try {
      if (!permission?.granted) {
        const { status } = await requestPermission();
        if (status !== 'granted') {
          alert('Camera permission is required to scan QR codes.');
          return;
        }
      }
      setModalVisible(true);
      qrCodeLock.current = false;
    } catch (error) {
      console.error('Error opening camera:', error);
    }
  }

  function qrCodeRead(data: string) {
    try {
      setModalVisible(false);

      const [id, name] = data.split(';');
      if (!id || !name) throw new Error('Invalid QR code format');

      const encodedName = encodeURIComponent(name.trim());
      router.push(`/locationDetails/${id}?locationName=${encodedName}`);
    } catch (error) {
      console.error('Error processing QR code:', error);
      alert('Failed to process QR code. Please try again.');
    }
  }


  return (
    <SafeAreaView style={{ flex: 1 }}>
      
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
        headerImage={
          <IconSymbol
            size={310}
            color="#808080"
            name="qrcode"
            style={styles.headerImage}
          />
        }>
        <ThemedView style={{ padding: 16, alignItems: 'center' }}>
          <ThemedText type="title">Explore</ThemedText>
        </ThemedView>

        <ThemedView>
          <ThemedText type="default" style={{ fontSize: 20, marginBottom: 24 }}>
            Welcome to the Explore screen. Here you can scan QR codes to navigate our app.
          </ThemedText>
          <ThemedText type="default" style={{ fontSize: 20, paddingBottom: 35 }}>
            Simply press the "Scan QRCode" button and point your camera at the location QRCode.
          </ThemedText>
        </ThemedView>


        <Button buttonText="Scan QRCode" onPress={handleOpenCamera}/>


        <Modal visible={modalIsVisible} style={{ flex: 1 }}>
          {permission?.granted ? (
            <CameraView
            style={{ flex: 1 }}
            facing="back"
            onBarcodeScanned={({data}) => {
              if (data && !qrCodeLock.current) {
                qrCodeLock.current = true;
                setTimeout(() => qrCodeRead(data), 500);
              }
            }} />
          ) : (
            <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ThemedText>Camera permission not granted</ThemedText>
            </ThemedView>
          )}
          <View style={styles.footer}>
            <Button buttonText="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </Modal>
        
        {!permission?.granted &&(
          <ThemedView style={{ padding: 16, alignItems: 'center' }}>
            <ThemedText type="default" style={{ fontSize: 16, marginTop: 5 }}>
              Camera permission not granted. Please enable it in your device settings.
            </ThemedText>
          </ThemedView>
        )}

      </ParallaxScrollView>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 32,
    right: 32,
  },
  button: {
    backgroundColor: "#000000",
  },
});