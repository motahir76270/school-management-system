import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Vibration, Platform } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { Camera, CameraView, useCameraPermissions } from 'expo-camera'
import HeaderSection from '@/components/features/header'
import { markAttendanceByQRScan } from '@/hooks/apiCalls/teacher'
import { FullScreenLoader } from '@/hooks/use-screensLoder'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'

const qrScan = () => {
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [torchOn, setTorchOn] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const safeInset = useSafeAreaInsets()
  const cameraRef = useRef(null)
  const lastScannedRef = useRef<string | null>(null)
  const scanTimeoutRef = useRef<any>(null)

  // Handle QR Code scan
  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    // Prevent duplicate scans
    if (isProcessing || scanned) return
    
    // Prevent scanning the same QR code multiple times rapidly
    if (lastScannedRef.current === data) {
      return
    }
    
    setScanned(true)
    setIsProcessing(true)
    lastScannedRef.current = data
    
    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } else {
      Vibration.vibrate(100)
    }
    
    try {
      setLoading(true)
      
      const payload = {
        qr_code: data
      }
      
      const res = await markAttendanceByQRScan(payload) 
      if (res.success === true) {
        Alert.alert(
          '✅ Attendance Marked',
           res?.student + ' - ' + res.message,
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset scanner after success
                resetScanner()
              }
            }
          ]
        )
      } else {
        Alert.alert(
          '❌ Failed',
          res?.message || 'Failed to mark attendance. Please try again.',
          [
            {
              text: 'Try Again',
              onPress: () => {
                resetScanner()
              }
            }
          ]
        )
      }
    } catch (error: any) {
      console.error("Error scanning QR:", error)
      Alert.alert(
        'Error',
        error?.message || 'An error occurred while marking attendance',
        [
          {
            text: 'Try Again',
            onPress: () => {
              resetScanner()
            }
          }
        ]
      )
    } finally {
      setLoading(false)
      setIsProcessing(false)
    }
  }

  // Reset scanner state
  const resetScanner = () => {
    setScanned(false)
    setIsProcessing(false)
    lastScannedRef.current = null
    
    // Clear any pending timeout
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current)
      scanTimeoutRef.current = null
    }
  }

  // Toggle torch
  const toggleTorch = () => {
    setTorchOn(!torchOn)
  }

  // Request camera permission on mount
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission()
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current)
      }
    }
  }, [])

  // If permission is not granted
  if (!permission) {
    return (
      <View style={styles.container}>
        <HeaderSection title="QR Scan" />
        <View style={styles.permissionContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.permissionText}>Requesting camera permission...</Text>
        </View>
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <HeaderSection title="QR Scan" />
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionDescription}>
            We need camera access to scan QR codes for attendance marking.
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <HeaderSection title="QR Scan" />
      
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          enableTorch={torchOn}
          onCameraReady={() => setCameraReady(true)}
        >
          {/* Scanning Overlay */}
          <View style={styles.overlay}>
            {/* Corner borders */}
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
            
            {/* Scanning animation line */}
            {!scanned && (
              <View style={styles.scanLine}>
                <View style={styles.scanLineInner} />
              </View>
            )}
            
            {/* Scanner status text */}
            <View style={styles.scannerStatus}>
              <Text style={styles.scannerStatusText}>
                {scanned ? '✅ Scanned!' : 'Place QR code in the frame'}
              </Text>
              {isProcessing && (
                <ActivityIndicator size="small" color="white" style={styles.processingIndicator} />
              )}
            </View>
          </View>
        </CameraView>
        
        {/* Camera Controls */}
        <View style={[styles.controlsContainer, { paddingBottom: safeInset.bottom || 20 }]}>
          <TouchableOpacity 
            style={[styles.controlButton, torchOn && styles.controlButtonActive]}
            onPress={toggleTorch}
          >
            <Text style={styles.controlIcon}>{torchOn ? '🔦' : '🔅'}</Text>
            <Text style={styles.controlLabel}>{torchOn ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>
          
          {scanned && (
            <TouchableOpacity 
              style={styles.scanAgainButton}
              onPress={resetScanner}
              disabled={isProcessing}
            >
              <Text style={styles.scanAgainText}>🔄 Scan Again</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => Alert.alert(
              'Info',
              'Scan the QR code displayed in the class to mark your attendance.'
            )}
          >
            <Text style={styles.controlIcon}>ℹ️</Text>
            <Text style={styles.controlLabel}>Help</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionIcon}>1️⃣</Text>
          <Text style={styles.instructionText}>Point camera at QR code</Text>
        </View>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionIcon}>2️⃣</Text>
          <Text style={styles.instructionText}>Keep code within the frame</Text>
        </View>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionIcon}>3️⃣</Text>
          <Text style={styles.instructionText}>Wait for confirmation</Text>
        </View>
      </View>
      
      <FullScreenLoader loading={loading} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 80,
    left: 40,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#00FF00',
    borderRadius: 2,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 80,
    right: 40,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#00FF00',
    borderRadius: 2,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 80,
    left: 40,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#00FF00',
    borderRadius: 2,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 80,
    right: 40,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#00FF00',
    borderRadius: 2,
  },
  scanLine: {
    position: 'absolute',
    top: 100,
    left: 50,
    right: 50,
    height: 2,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  scanLineInner: {
    height: '100%',
    backgroundColor: '#00FF00',
    width: '100%',
    opacity: 0.8,
    shadowColor: '#00FF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  scannerStatus: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  scannerStatusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  processingIndicator: {
    marginLeft: 8,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  controlButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    minWidth: 60,
  },
  controlButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  controlIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
  controlLabel: {
    color: 'white',
    fontSize: 11,
    fontWeight: '500',
  },
  scanAgainButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanAgainText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  instructionIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 30,
  },
  instructionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f5f5f5',
  },
  permissionIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})

export default qrScan