import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import HeaderSection from '@/components/features/header';
import { Colors } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height, width } = Dimensions.get('window');

const ReportCardPreview = () => {
  const [loading, setLoading] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const { id, print_url } = useLocalSearchParams();

  const loadHTML = async (url: any) => {
    try {
      console.log('Loading URL:', url);
      setLoading(true);
      setError(false);
      const token = JSON.parse(await AsyncStorage.getItem("token") as any);
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Content-Type:', response.headers.get('content-type'));
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const html = await response.text();
      console.log('HTML length:', html.length);
      setHtmlContent(html);
      setLoading(false);
    } catch (error) {
      console.error('Error loading HTML:', error);
      setError(true);
      setLoading(false);
      Alert.alert('Error', 'Failed to load receipt. Please try again.');
    }
  };

  const handleRetry = () => {
    if (print_url) {
      loadHTML(print_url as any);
    }
  };

  useEffect(() => {
    if (print_url) {
      loadHTML(print_url as any);
    } else {
      setError(true);
      Alert.alert("Error", "Print URL not available");
    }
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderSection title="Receipt" />

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading Receipt...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            Failed to load receipt
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.primary }]} 
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        htmlContent && (
          <WebView
            source={{ html: htmlContent }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            scalesPageToFit={true}
            originWhitelist={['*']}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Rendering Receipt...
                </Text>
              </View>
            )}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView error:', nativeEvent);
              setError(true);
              setLoading(false);
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
    marginBottom:50
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
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

export default ReportCardPreview;