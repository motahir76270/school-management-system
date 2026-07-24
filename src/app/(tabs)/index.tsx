import * as Device from 'expo-device';
import { 
  StyleSheet, View, FlatList, RefreshControl, ActivityIndicator 
} from 'react-native';
import { BottomTabInset, Spacing, MaxContentWidth } from '@/constants/theme';
import Navbar from '@/components/home/navbar/navbar';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import StudentFeatureSection from '@/components/home/sections/studentFeatures';
import { getTeacherPostData, getTeacherTimeTable } from '@/hooks/apiCalls/teacher';
import { getStudentPostData, getStudentTimeTable } from '@/hooks/apiCalls/student';
import TeacherFeatureSection from '@/components/home/sections/teacherFeatures';
import PostSections from '@/components/home/sections/postSections';
import { getStudentProfile, getTeacherProfile } from '@/redux/slices/authSlice';
import {  showError, showWarning  } from '@/components/service/AlertService';

export default function HomeScreen() {
  const { user } = useSelector((state: any) => state.auth);
  // console.log();
  
  
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load data function
  const loadData = async () => {
    try {
      const parsedUser = JSON.parse(await AsyncStorage.getItem("user") as any);
      if (parsedUser?.user?.role === "teacher") {
        await getTeacherProfile(dispatch);
        await getTeacherTimeTable(dispatch);
        await getTeacherPostData(dispatch);
      } else {
        await getStudentProfile(dispatch);
        await getStudentTimeTable(dispatch);
        await getStudentPostData(dispatch);
      }
      return true;
    } catch (error) {
      showError('Failed to load data. Please try again.', 'Error');
      return false;
    }
  };

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const token = JSON.parse(await AsyncStorage.getItem("token") as any);
      console.log("Token retrieved on refresh:", token);
      if (!token) {
        router.replace("/(auth)/initial");
        return;
      }
      await loadData();
    } catch (error) {
      showWarning('Server not responding! Please check internet connection.', 'Warning');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);
      try {
        const token = JSON.parse(await AsyncStorage.getItem("token") as any);
        if (!token) {
          router.replace("/(auth)/initial");
          setLoading(false);
          return;
        }
        await loadData();
      } catch (error) {
        showError('Failed to initialize app. Please restart.', 'Error');
      } finally {
        setLoading(false);
      }
    };
    initializeApp();
  }, []);

  // Render each section
  const renderSection = ({ item, index }: { item: string; index: number }) => {
    switch (item) {
      case 'navbar':
        return <Navbar />;
      case 'features':
        return user?.role === "teacher" ? 
          <TeacherFeatureSection /> : 
          <StudentFeatureSection />;
      case 'posts':
        return <PostSections />;
      default:
        return null;
    }
  };

  // Define sections order
  const sections = ['navbar', 'features', 'schedule', 'posts'];

  // Show loading screen while initializing
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sections}
        renderItem={renderSection}
        keyExtractor={(item, index) => `${item}-${index}`}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
            progressBackgroundColor="#ffffff"
            title="Pull to refresh"
            titleColor="#007AFF"
          />
        }
        removeClippedSubviews={false}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  flatListContent: {
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});