import * as Device from 'expo-device';
import { Platform, StyleSheet,View,ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import Navbar from '@/components/home/navbar/navbar';
import FeatureSection from '@/components/home/sections/features';
import ScheduleSection from '@/components/home/sections/ScheduleSection';
import { router } from 'expo-router';



export default function HomeScreen() {
  
  // const data = "a"
  //   if(data === "a"){
  //     return router.replace('/(auth)/initial')
  //   }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.safeArea}>
       <Navbar />
       <FeatureSection />
       <ScheduleSection />
      </ScrollView>
    </ThemedView>
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
