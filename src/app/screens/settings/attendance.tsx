import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import HeaderSection from '@/components/features/header';

interface Subject {
  id: string;
  name: string;
  totalClasses: number;
  attended: number;
  percentage: number;
}

const Attendance = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const [selectedMonth, setSelectedMonth] = useState('March 2024');

  const subjects: Subject[] = [
    { id: '1', name: 'Mathematics', totalClasses: 45, attended: 42, percentage: 93.3 },
    { id: '2', name: 'Physics', totalClasses: 40, attended: 36, percentage: 90.0 },
    { id: '3', name: 'Chemistry', totalClasses: 38, attended: 35, percentage: 92.1 },
    { id: '4', name: 'English', totalClasses: 42, attended: 40, percentage: 95.2 },
    { id: '5', name: 'Computer Science', totalClasses: 35, attended: 33, percentage: 94.3 },
  ];

  const overallPercentage = subjects.reduce((sum, sub) => sum + sub.percentage, 0) / subjects.length;

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return '#4CAF50';
    if (percentage >= 75) return '#FFC107';
    return '#F44336';
  };

  return (
    <View style={styles.mainContainer}>
      {/* Fixed Header */}
      <HeaderSection title="Attendance" />
      
      {/* Scrollable Content */}
      <ScrollView 
        style={[styles.scrollContainer, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={[styles.overallCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.overallLabel, { color: colors.textSecondary }]}>Overall Attendance</Text>
            <Text style={[styles.overallPercentage, { color: getAttendanceColor(overallPercentage) }]}>
              {overallPercentage.toFixed(1)}%
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${overallPercentage}%`, backgroundColor: getAttendanceColor(overallPercentage) }]} />
            </View>
          </View>

          <View style={styles.monthSelector}>
            <TouchableOpacity>
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.monthText, { color: colors.text }]}>{selectedMonth}</Text>
            <TouchableOpacity>
              <Ionicons name="chevron-forward" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {subjects.map((subject) => (
            <View key={subject.id} style={[styles.subjectCard, { backgroundColor: colors.card }]}>
              <View style={styles.subjectHeader}>
                <Text style={[styles.subjectName, { color: colors.text }]}>{subject.name}</Text>
                <Text style={[styles.percentage, { color: getAttendanceColor(subject.percentage) }]}>
                  {subject.percentage}%
                </Text>
              </View>
              
              <View style={styles.attendanceStats}>
                <View style={styles.statItem}>
                  <MaterialIcons name="class" size={20} color={colors.primary} />
                  <Text style={[styles.statText, { color: colors.textSecondary }]}>
                    Total: {subject.totalClasses}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  <Text style={[styles.statText, { color: colors.textSecondary }]}>
                    Attended: {subject.attended}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="close-circle" size={20} color={colors.error || '#F44336'} />
                  <Text style={[styles.statText, { color: colors.textSecondary }]}>
                    Missed: {subject.totalClasses - subject.attended}
                  </Text>
                </View>
              </View>
              
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${subject.percentage}%`, backgroundColor: getAttendanceColor(subject.percentage) }
                  ]} 
                />
              </View>
            </View>
          ))}
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
    paddingBottom: 20,
  },
  overallCard: {
    margin: 15,
    marginTop: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  overallLabel: {
    fontSize: 14,
    marginBottom: 10,
  },
  overallPercentage: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
  },
  subjectCard: {
    margin: 15,
    marginVertical: 8,
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
  },
  percentage: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  attendanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    marginLeft: 5,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default Attendance;