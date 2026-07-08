// screens/features/salarySlip/[id].tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import HeaderSection from '@/components/features/header';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SalarySlipPreview = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const recordData = params.recordData ? JSON.parse(params.recordData as string) : null;
  const token = params.token as string || "";
  const recordId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [record, setRecord] = useState<any>(recordData);

  useEffect(() => {
    if (record) {
      loadPDF();
    }
  }, [record]);

  const loadPDF = async () => {
    try {
      setLoading(true);
      setError(false);
      
      const pdfUrl = record?.receipt_pdf_url;

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

  const getPDFHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
          <title>Salary Slip</title>
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
            
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            
            const viewer = document.getElementById('viewer');
            
            async function renderPDF() {
              try {
                const binaryString = atob(pdfData);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                
                const loadingTask = pdfjsLib.getDocument({ data: bytes });
                const pdf = await loadingTask.promise;
                const totalPages = pdf.numPages;
                
                viewer.innerHTML = '';
                
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
      <HeaderSection title="Salary Slip" />

      {/* Record Info Bar */}
      {record && (
        <View style={styles.recordInfoBar}>
          <View style={styles.recordInfoLeft}>
            <Text style={styles.recordInfoTitle}>{record.month_label}</Text>
            <Text style={styles.recordInfoSub}>
              {record.receipt_no} • {record.status_label}
            </Text>
          </View>
          <Text style={styles.recordInfoAmount}>₹{record.net_salary.toLocaleString()}</Text>
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
  recordInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  recordInfoLeft: {
    flex: 1,
  },
  recordInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  recordInfoSub: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  recordInfoAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2e7d32',
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

export default SalarySlipPreview;