import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, Alert } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import HeaderSection from '@/components/features/header';
import { getStudentResults } from '@/hooks/apiCalls/student';
import { useDispatch, useSelector } from 'react-redux';
import { FullScreenLoader } from '@/hooks/use-screensLoder';

// Updated interface to match API response
interface SubjectResult {
  subject_id: string;
  subject_name: string;
  theory_marks: number;
  practical_marks: number;
  internal_marks: number;
  marks_obtained: number;
  max_marks: number;
  grade: string;
  is_absent: boolean;
  display_total: string;
  subject_remarks: string | null;
}

interface ExamResult {
  exam_id: string;
  exam_name: string;
  exam_type: string;
  type_label: string;
  start_date: string;
  end_date: string;
  summary: {
    percentage: number;
    grade: string;
    status: string;
    subjects_total: number;
    subjects_entered: number;
    is_complete: boolean;
    total_obtained: number;
    total_max: number;
    attendance_rate: number;
    remarks: string | null;
    rank: number;
  };
  subjects: SubjectResult[];
}

const MyResult = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const dispatch = useDispatch();
  const { resultData } = useSelector((state: any) => state.student);

  // Get current selected exam data
  const currentExam = examResults.find(exam => exam.exam_id === selectedExamId) || examResults[0];
  
  // Get subjects for current exam
  const subjects: SubjectResult[] = currentExam?.subjects || [];
  
  // Get summary for current exam
  const summary = currentExam?.summary;

  const getGradeColor = (grade: string) => {
    if (!grade) return '#6c757d';
    const gradeMap: { [key: string]: string } = {
      'A+': '#4CAF50',
      'A': '#8BC34A',
      'A-': '#CDDC39',
      'B+': '#FFC107',
      'B': '#FF9800',
      'C+': '#FF5722',
      'C': '#f44336',
      'D': '#e91e63',
      'F': '#9e9e9e'
    };
    return gradeMap[grade] || '#6c757d';
  };

  const getStatusColor = (status: string) => {
    return status?.toLowerCase() === 'pass' ? '#4CAF50' : '#f44336';
  };

  const fetchResultData = async () => {
    try {
      setLoading(true);
      const res = await getStudentResults();
      
      if (res?.success === true && res?.results) {
        setExamResults(res.results);
        // Set first exam as selected by default
        if (res.results.length > 0) {
          setSelectedExamId(res.results[0].exam_id);
          setSelectedExam(res.results[0].exam_name);
        }
      } else {
        Alert.alert("Failed", res?.message || "No results found");
      }
    } catch (error: any) {
      Alert.alert("Failed", error?.message || "Server not responding! Please check internet connection");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResultData();
  }, []);

  // Handle exam navigation
  const handlePreviousExam = () => {
    const currentIndex = examResults.findIndex(exam => exam.exam_id === selectedExamId);
    if (currentIndex > 0) {
      const prevExam = examResults[currentIndex - 1];
      setSelectedExamId(prevExam.exam_id);
      setSelectedExam(prevExam.exam_name);
    }
  };

  const handleNextExam = () => {
    const currentIndex = examResults.findIndex(exam => exam.exam_id === selectedExamId);
    if (currentIndex < examResults.length - 1) {
      const nextExam = examResults[currentIndex + 1];
      setSelectedExamId(nextExam.exam_id);
      setSelectedExam(nextExam.exam_name);
    }
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
          {currentExam && summary && (
            <>
              <View style={[styles.overallCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.overallLabel, { color: colors.textSecondary }]}>Overall Performance</Text>
                <Text style={[styles.overallPercentage, { color: getGradeColor(summary.grade) }]}>
                  {summary.percentage.toFixed(1)}%
                </Text>
                <View style={styles.gradeContainer}>
                  <Text style={[styles.overallGrade, { color: getGradeColor(summary.grade) }]}>
                    Grade: {summary.grade}
                  </Text>
                  <Text style={[styles.statusText, { color: getStatusColor(summary.status) }]}>
                    {summary.status}
                  </Text>
                </View>
                <View style={styles.summaryDetails}>
                  <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                    Total: {summary.total_obtained}/{summary.total_max}
                  </Text>
                  <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                    Rank: #{summary.rank}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${summary.percentage}%`, backgroundColor: getGradeColor(summary.grade) }]} />
                </View>
              </View>

              <View style={styles.examSelector}>
                <TouchableOpacity 
                  onPress={handlePreviousExam}
                  disabled={examResults.findIndex(exam => exam.exam_id === selectedExamId) === 0}
                >
                  <Ionicons 
                    name="chevron-back" 
                    size={24} 
                    color={examResults.findIndex(exam => exam.exam_id === selectedExamId) === 0 ? colors.textSecondary : colors.primary} 
                  />
                </TouchableOpacity>
                <View style={styles.examInfo}>
                  <Text style={[styles.examText, { color: colors.text }]}>{selectedExam}</Text>
                  <Text style={[styles.examTypeText, { color: colors.textSecondary }]}>{currentExam.type_label}</Text>
                  <Text style={[styles.examDateText, { color: colors.textSecondary }]}>
                    {currentExam.start_date} - {currentExam.end_date}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={handleNextExam}
                  disabled={examResults.findIndex(exam => exam.exam_id === selectedExamId) === examResults.length - 1}
                >
                  <Ionicons 
                    name="chevron-forward" 
                    size={24} 
                    color={examResults.findIndex(exam => exam.exam_id === selectedExamId) === examResults.length - 1 ? colors.textSecondary : colors.primary} 
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.subjectHeader}>
                <Text style={[styles.headerText, { color: colors.text }]}>Subject</Text>
                <Text style={[styles.headerText, { color: colors.text }]}>Marks</Text>
                <Text style={[styles.headerText, { color: colors.text }]}>Grade</Text>
              </View>

              {subjects.map((subject) => (
                <View key={subject.subject_id} style={[styles.resultCard, { backgroundColor: colors.card }]}>
                  <View style={styles.resultRow}>
                    <Text style={[styles.subjectName, { color: colors.text }]}>{subject.subject_name}</Text>
                    <Text style={[styles.marks, { color: colors.text }]}>
                      {subject.marks_obtained}/{subject.max_marks}
                    </Text>
                    <Text style={[styles.grade, { color: getGradeColor(subject.grade) }]}>{subject.grade}</Text>
                  </View>
                  <View style={styles.resultDetails}>
                    <View style={styles.percentageContainer}>
                      <Text style={[styles.percentageText, { color: colors.textSecondary }]}>
                        {(subject.marks_obtained / subject.max_marks * 100).toFixed(1)}%
                      </Text>
                      {subject.is_absent && (
                        <Text style={[styles.absentText, { color: '#f44336' }]}> (Absent)</Text>
                      )}
                    </View>
                    <View style={styles.marksBreakdown}>
                      <Text style={[styles.breakdownText, { color: colors.textSecondary }]}>
                        Theory: {subject.theory_marks} | Practical: {subject.practical_marks} | Internal: {subject.internal_marks}
                      </Text>
                    </View>
                    <View style={styles.progressBarSmall}>
                      <View style={[styles.progressFillSmall, { 
                        width: `${(subject.marks_obtained / subject.max_marks * 100)}%`, 
                        backgroundColor: getGradeColor(subject.grade) 
                      }]} />
                    </View>
                  </View>
                </View>
              ))}

              {summary.remarks && (
                <View style={styles.remarksSection}>
                  <Text style={[styles.remarksTitle, { color: colors.text }]}>Remarks</Text>
                  <Text style={[styles.remarksText, { color: colors.textSecondary }]}>
                    {summary.remarks}
                  </Text>
                </View>
              )}
            </>
          )}

          {examResults.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                No results available
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      <FullScreenLoader loading={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1
  },
  content: {
    paddingBottom: 120,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  overallGrade: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
  },
  examSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  examInfo: {
    alignItems: 'center',
    flex: 1,
  },
  examText: {
    fontSize: 18,
    fontWeight: '600',
  },
  examTypeText: {
    fontSize: 14,
    marginTop: 2,
  },
  examDateText: {
    fontSize: 12,
    marginTop: 2,
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  percentageText: {
    fontSize: 12,
  },
  absentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  marksBreakdown: {
    marginBottom: 8,
  },
  breakdownText: {
    fontSize: 11,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
  },
});

export default MyResult;