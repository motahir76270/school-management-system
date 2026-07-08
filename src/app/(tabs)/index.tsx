import * as Device from 'expo-device';
import { 
  StyleSheet, View, ScrollView, RefreshControl, Alert } from 'react-native';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import Navbar from '@/components/home/navbar/navbar';
import {  router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getStudentProfile, getTeacherProfile } from '@/hooks/apiCalls/auth';
import StudentFeatureSection from '@/components/home/sections/studentFeatures';
import { getTeacherPostData, getTeacherTimeTable } from '@/hooks/apiCalls/teacher';
import { getStudentPostData, getStudentTimeTable } from '@/hooks/apiCalls/student';
import StudentScheduleSection from '@/components/home/sections/studentScheduleSection';
import TeacherFeatureSection from '@/components/home/sections/teacherFeatures';
import TechaerScheduleSection from '@/components/home/sections/teacherScheduleSection';
import PostSections from '@/components/home/sections/postSections';

export default function HomeScreen() {
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
    
  // Your data loading function
  const loadData = async () => {
    const parsedUser = JSON.parse( await AsyncStorage.getItem("user") as any)
    if(parsedUser?.user?.role === "teacher"){
      await getTeacherProfile(dispatch);
      await getTeacherTimeTable(dispatch);
      await getTeacherPostData(dispatch)
    }else {
      await getStudentProfile(dispatch)
       await getStudentTimeTable(dispatch);
      await getStudentPostData(dispatch)
    }
  };

 

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const token = JSON.parse(await AsyncStorage.getItem("token") as any);
       console.log("Token retrieved on refresh:", token); // Debugging line
      if (!token) {
        router.replace("/(auth)/initial");
      }
      await loadData(); // Call your data loading function only on pull
    } catch (error) {
        Alert.alert("Warning", "Server not respose! Please check internet connections")
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Only check authentication on mount, don't call loadData
    const checkAuth = async () => {
      try {
        const parsedUser = JSON.parse(await AsyncStorage.getItem("token") as any);
        if (!parsedUser) {
          router.replace("/(auth)/initial");
        }else{
          await loadData();
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };
    checkAuth();
  }, []); // Empty dependency array - runs only once on mount

  return (
    <View style={styles.container}>

      <ScrollView 
        style={styles.safeArea}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']} // iOS
            tintColor="#007AFF" // iOS
            progressBackgroundColor="#ffffff" // Android
            title="Pull to refresh" // iOS
            titleColor="#007AFF" // iOS
          />
        }
      >
        <Navbar />
        { user?.role === "teacher" ?
        <>
         <TeacherFeatureSection />
         {/* <TechaerScheduleSection />:  */}
        </>
         :
         <> 
         <StudentFeatureSection />
         {/* <StudentScheduleSection /> */}
         </>
          }

          <PostSections />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  safeArea: {
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
});