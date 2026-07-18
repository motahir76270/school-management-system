// src/components/home/sections/features.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Image } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { images } from '@/constants/string';

interface ServiceItem {
  id: string;
  title: string;
  image: any;
  screen: string;
}


const services: ServiceItem[] = [
  // { id: '1', title: 'My Classes', image: images.classes, screen: '/screens/features/myClasses' },
  { id: '2', title: 'Attendance', image: images.attendance, screen: '/screens/features/myAttendance' },
  // { id: '3', title: 'Home Work', image: images.work, screen: '/screens/features/homeWork' },
  { id: '4', title: 'Assignment', image: images.assignment, screen: '/screens/features/assignment' },
  { id: '6', title: 'Salary Slips', image: images.result, screen: '/screens/features/slarySlip/history' },

  // { id: '7', title: 'Exams', image: images.exams, screen: '/screens/features/exams' },

  { id: '7', title: 'Mark Entry', image: images.exams, screen: '/screens/features/marksEntry/page' },

  { id: '8', title: 'Time Table', image: images.timeTable, screen: '/screens/features/timeTable' }, 
  { id: '9', title: 'Leave', image: images.leaves, screen: '/screens/features/leaves' }, 
];

const TeacherFeatureSection = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Features</Text>
        <TouchableOpacity>
          <Text style={[styles.viewAll, { color: colors.primary }]}></Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.grid}>
        {services.map((item:any) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.serviceCard} 
            onPress={() => router.push(item.screen as any)}
          >
            <View style={[styles.imageContainer, { backgroundColor: colors.backgroundElement }]}>
              <Image 
                source={item.image} 
                style={styles.serviceImage}
                resizeMode="cover"
              />
            </View>
            <Text style={[styles.serviceTitle, { color: colors.textSecondary }]}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    justifyContent:"flex-start"
  },
  serviceCard: {
    width: '29%',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5,
    borderWidth:1,
    borderColor:"#dadada",
    borderRadius:10,
    marginLeft:10,
    padding:10
  },
  imageContainer: {
    width: 65,
    height: 65,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  serviceTitle: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default TeacherFeatureSection;