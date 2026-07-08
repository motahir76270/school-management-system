import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderSection from '@/components/features/header';


const { height, width } = Dimensions.get('window');

const FeeReceiptPreview = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  // Get data from params
  const receiptData = params.receiptData ? JSON.parse(params.receiptData as string) : null;
  const token = params.token as string || "";
  const receiptId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [receipt, setReceipt] = useState<any>(receiptData);

  useEffect(() => {
    if (receipt) {
      loadPDF();
    } else if (receiptId) {
      fetchReceiptData();
    }
  }, [receipt]);

  const fetchReceiptData = async () => {
    try {
      setLoading(true);
      // Fetch receipt data from API using the ID
      const response = await fetch(`https://your-api.com/fee-receipts/${receiptId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch receipt data');
      }

      const data = await response.json();
      setReceipt(data);
      await loadPDF(data);
    } catch (error) {
      console.error('Error fetching receipt:', error);
      setError(true);
      setLoading(false);
      Alert.alert('Error', 'Failed to load receipt data');
    }
  };

  const loadPDF = async (receiptDataParam?: any) => {
    try {
      setLoading(true);
      setError(false);
      
      const receiptToUse = receiptDataParam || receipt;
      const pdfUrl = receiptToUse?.pdf_url;

      if (!pdfUrl) {
        throw new Error('PDF URL not found');
      }

      const response = await fetch(pdfUrl, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status}`);
      }

      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          const base64Data = reader.result as string;
          const base64String = base64Data.split(',')[1];
          setPdfBase64(base64String);
          setLoading(false);
        } catch (err) {
          console.error('Error processing PDF:', err);
          setError(true);
          setLoading(false);
        }
      };

      reader.onerror = () => {
        console.error('Error reading blob');
        setError(true);
        setLoading(false);
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error loading PDF:', error);
      setError(true);
      setLoading(false);
      Alert.alert('Error', 'Failed to load PDF. Please try again.');
    }
  };

  // Generate HTML with PDF.js library for better PDF rendering
  const getPDFHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
          <title>PDF Viewer</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              background: #f5f5f5;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              height: 100vh;
              overflow: auto;
            }
            #viewer {
              width: 100%;
              min-height: 100%;
              padding: 10px;
            }
            .page-container {
              background: white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              margin: 10px auto;
              max-width: 100%;
              overflow: hidden;
            }
            canvas {
              display: block;
              width: 100%;
              height: auto;
            }
            .loading-text {
              text-align: center;
              padding: 40px;
              color: #666;
              font-size: 16px;
            }
            .error-text {
              text-align: center;
              padding: 40px;
              color: #F44336;
              font-size: 16px;
            }
          </style>
        </head>
        <body>
          <div id="viewer">
            <div class="loading-text">Loading PDF...</div>
          </div>

          <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
          <script>
            const pdfData = '${pdfBase64}';
            
            // Set worker source
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            
            const viewer = document.getElementById('viewer');
            
            async function renderPDF() {
              try {
                // Convert base64 to Uint8Array
                const binaryString = atob(pdfData);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                
                // Load PDF
                const loadingTask = pdfjsLib.getDocument({ data: bytes });
                const pdf = await loadingTask.promise;
                const totalPages = pdf.numPages;
                
                // Clear viewer
                viewer.innerHTML = '';
                
                // Render all pages
                for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
                  const page = await pdf.getPage(pageNum);
                  
                  const container = document.createElement('div');
                  container.className = 'page-container';
                  
                  const canvas = document.createElement('canvas');
                  container.appendChild(canvas);
                  viewer.appendChild(container);
                  
                  const viewport = page.getViewport({ scale: 1.5 });
                  const context = canvas.getContext('2d');
                  
                  canvas.height = viewport.height;
                  canvas.width = viewport.width;
                  
                  const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                  };
                  
                  await page.render(renderContext).promise;
                }
                
              } catch (error) {
                console.error('Error rendering PDF:', error);
                viewer.innerHTML = '<div class="error-text">Failed to render PDF. Please try again.</div>';
                window.ReactNativeWebView.postMessage('ERROR');
              }
            }
            
            renderPDF();
          </script>
        </body>
      </html>
    `;
  };

  const handleRetry = () => {
    loadPDF();
  };

  return (
    <View style={styles.container}>
     <HeaderSection title="Recepit" />

      {/* Receipt Info Bar */}
      {receipt && (
        <View style={styles.receiptInfoBar}>
          <Text style={styles.receiptInfoText}>
            {receipt.fee_name} - {receipt.receipt_no}
          </Text>
          <Text style={styles.receiptInfoAmount}>₹{receipt.amount}</Text>
        </View>
      )}

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
          <Text style={styles.loadingText}>Loading PDF...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#F44336" />
          <Text style={styles.errorText}>Failed to load PDF</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        pdfBase64 && (
          <WebView
            source={{ html: getPDFHTML() }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            scalesPageToFit={true}
            originWhitelist={['*']}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1976d2" />
                <Text style={styles.loadingText}>Rendering PDF...</Text>
              </View>
            )}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView error:', nativeEvent);
              setError(true);
              setLoading(false);
            }}
            onMessage={(event) => {
              if (event.nativeEvent.data === 'ERROR') {
                setError(true);
                setLoading(false);
              }
            }}
            onLoadEnd={() => {
              setLoading(false);
            }}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  receiptInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  receiptInfoText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  receiptInfoAmount: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '700',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FeeReceiptPreview;