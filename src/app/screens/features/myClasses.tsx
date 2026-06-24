import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, FlatList } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import HeaderSection from '@/components/features/header';

interface Class {
  id: string;
  name: string;
  subject: string;
  teacher: string;
  room: string;
  time: string;
  days: string[];
}

const MyClasses = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const [selectedDay, setSelectedDay] = useState('Monday');

  const classes: Class[] = [
    { id: '1', name: 'Mathematics', subject: 'Math', teacher: 'Mr. Smith', room: '101', time: '09:00 AM', days: ['Monday', 'Wednesday', 'Friday'] },
    { id: '2', name: 'Science', subject: 'Physics', teacher: 'Dr. Johnson', room: '102', time: '10:00 AM', days: ['Monday', 'Tuesday', 'Thursday'] },
    { id: '3', name: 'English', subject: 'Literature', teacher: 'Ms. Davis', room: '103', time: '11:00 AM', days: ['Monday', 'Wednesday', 'Friday'] },
    { id: '4', name: 'History', subject: 'World History', teacher: 'Mr. Brown', room: '104', time: '12:00 PM', days: ['Tuesday', 'Thursday'] },
    { id: '5', name: 'Computer Science', subject: 'Programming', teacher: 'Mrs. Wilson', room: 'Lab 1', time: '02:00 PM', days: ['Monday', 'Wednesday'] },
  ];

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const filteredClasses = classes.filter(cls => cls.days.includes(selectedDay));

  const renderClassItem = ({ item }: { item: Class }) => (
    <TouchableOpacity style={[styles.classCard, { backgroundColor: colors.card, borderColor: colors.border || '#E0E0E0' }]}>
      <View style={styles.classHeader}>
        <View style={[styles.subjectIcon, { backgroundColor: colors.primary + '20' }]}>
          <FontAwesome5 name="book" size={20} color={colors.primary} />
        </View>
        <View style={styles.classInfo}>
          <Text style={[styles.className, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.subjectName, { color: colors.textSecondary }]}>{item.subject}</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.classDetails, { borderTopColor: colors.border || '#E0E0E0' }]}>
        <View style={styles.detailItem}>
          <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.teacher}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>Room {item.room}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      {/* Fixed Header */}
      <HeaderSection title="My Classes" />
      
      {/* Scrollable Content */}
      <ScrollView 
        style={[styles.scrollContainer, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.daySelector}>
            {weekDays.map(day => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayButton,
                  selectedDay === day && { backgroundColor: colors.primary },
                  { backgroundColor: selectedDay === day ? colors.primary : colors.card }
                ]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[
                  styles.dayText,
                  { color: selectedDay === day ? '#FFF' : colors.text }
                ]}>
                  {day.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={filteredClasses}
            renderItem={renderClassItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.classList}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  daySelector: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 20,
    marginTop: 20,
  },
  dayButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 3,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  classList: {
    padding: 15,
    paddingBottom: 20,
  },
  classCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subjectName: {
    fontSize: 13,
    marginTop: 2,
  },
  classDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    marginLeft: 5,
  },
});

export default MyClasses;