import { StyleSheet, View, Button, Modal } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';


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
      // Validate that the scanned data is a number
      const id = parseInt(data, 10);
      if (isNaN(id)) {
        alert('Invalid QR code: Please scan a QR code containing a number.');
        return;
      }

      setModalVisible(false);
      // Navigate to partDetail/[id] with the scanned number
      console.log('QR Code scanned:', id);
      router.push(`/partDetail/${id}`);
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
            name="chevron.left.forwardslash.chevron.right"
            style={styles.headerImage}
          />
        }>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Explore</ThemedText>
        </ThemedView>
        <Button title="Ler QRCode" onPress={handleOpenCamera} />
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
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </Modal>
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
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 32,
    right: 32,
  },
});