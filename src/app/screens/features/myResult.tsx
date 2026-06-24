import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import HeaderSection from '@/components/features/header';

interface Result {
  id: string;
  subject: string;
  examType: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  status: 'pass' | 'fail';
}

const MyResult = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const [selectedExam, setSelectedExam] = useState('Mid Term 2024');

  const results: Result[] = [
    { id: '1', subject: 'Mathematics', examType: 'Mid Term 2024', totalMarks: 100, obtainedMarks: 85, percentage: 85, grade: 'A', status: 'pass' },
    { id: '2', subject: 'Physics', examType: 'Mid Term 2024', totalMarks: 100, obtainedMarks: 78, percentage: 78, grade: 'B+', status: 'pass' },
    { id: '3', subject: 'Chemistry', examType: 'Mid Term 2024', totalMarks: 100, obtainedMarks: 82, percentage: 82, grade: 'A-', status: 'pass' },
    { id: '4', subject: 'English', examType: 'Mid Term 2024', totalMarks: 100, obtainedMarks: 88, percentage: 88, grade: 'A', status: 'pass' },
    { id: '5', subject: 'Computer Science', examType: 'Mid Term 2024', totalMarks: 100, obtainedMarks: 92, percentage: 92, grade: 'A+', status: 'pass' },
  ];

  const overallPercentage = results.reduce((sum, sub) => sum + sub.percentage, 0) / results.length;
  const overallGrade = overallPercentage >= 90 ? 'A+' : overallPercentage >= 80 ? 'A' : overallPercentage >= 70 ? 'B+' : overallPercentage >= 60 ? 'B' : 'C';

  const getGradeColor = (grade: string) => {
    if (grade === 'A+') return '#4CAF50';
    if (grade === 'A') return '#8BC34A';
    if (grade === 'A-') return '#CDDC39';
    if (grade === 'B+') return '#FFC107';
    return '#FF9800';
  };

  return (
    <View style={styles.mainContainer}>
      {/* Fixed Header */}
      <HeaderSection title="My Results" />
      
      {/* Scrollable Content */}
      <ScrollView 
        style={[styles.scrollContainer, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={[styles.overallCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.overallLabel, { color: colors.textSecondary }]}>Overall Performance</Text>
            <Text style={[styles.overallPercentage, { color: getGradeColor(overallGrade) }]}>
              {overallPercentage.toFixed(1)}%
            </Text>
            <View style={styles.gradeContainer}>
              <Text style={[styles.overallGrade, { color: getGradeColor(overallGrade) }]}>
                Grade: {overallGrade}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${overallPercentage}%`, backgroundColor: getGradeColor(overallGrade) }]} />
            </View>
          </View>

          <View style={styles.examSelector}>
            <TouchableOpacity>
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.examText, { color: colors.text }]}>{selectedExam}</Text>
            <TouchableOpacity>
              <Ionicons name="chevron-forward" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.subjectHeader}>
            <Text style={[styles.headerText, { color: colors.text }]}>Subject</Text>
            <Text style={[styles.headerText, { color: colors.text }]}>Marks</Text>
            <Text style={[styles.headerText, { color: colors.text }]}>Grade</Text>
          </View>

          {results.map((result) => (
            <View key={result.id} style={[styles.resultCard, { backgroundColor: colors.card }]}>
              <View style={styles.resultRow}>
                <Text style={[styles.subjectName, { color: colors.text }]}>{result.subject}</Text>
                <Text style={[styles.marks, { color: colors.text }]}>
                  {result.obtainedMarks}/{result.totalMarks}
                </Text>
                <Text style={[styles.grade, { color: getGradeColor(result.grade) }]}>{result.grade}</Text>
              </View>
              <View style={styles.resultDetails}>
                <View style={styles.percentageContainer}>
                  <Text style={[styles.percentageText, { color: colors.textSecondary }]}>
                    {result.percentage}%
                  </Text>
                </View>
                <View style={styles.progressBarSmall}>
                  <View style={[styles.progressFillSmall, { width: `${result.percentage}%`, backgroundColor: getGradeColor(result.grade) }]} />
                </View>
              </View>
            </View>
          ))}

          <View style={styles.remarksSection}>
            <Text style={[styles.remarksTitle, { color: colors.text }]}>Remarks</Text>
            <Text style={[styles.remarksText, { color: colors.textSecondary }]}>
              Excellent performance! Keep up the good work. Your improvement in Mathematics is notable.
            </Text>
          </View>
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
    paddingBottom: 20, // Add padding at bottom for better scrolling experience
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
    marginBottom: 10,
  },
  gradeContainer: {
    marginBottom: 15,
  },
  overallGrade: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  examSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  examText: {
    fontSize: 18,
    fontWeight: '600',
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 10,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultCard: {
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
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 2,
  },
  marks: {
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
  },
  grade: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  resultDetails: {
    marginTop: 8,
  },
  percentageContainer: {
    marginBottom: 5,
  },
  percentageText: {
    fontSize: 12,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressBarSmall: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFillSmall: {
    height: '100%',
    borderRadius: 3,
  },
  remarksSection: {
    margin: 20,
    padding: 15,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
  },
  remarksTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  remarksText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default MyResult;