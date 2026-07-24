import { View, Text, useColorScheme, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { useSelector } from 'react-redux';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Class {
  school_class_id: string;
  section_id: string;
  class_name: string;
  section_name: string;
  schedule_count: number;
  student_count: number;
  marks_entered: number;
  class_entry_url: string;
}

interface Exam {
  id: string;
  name: string;
  type: string;
  type_label: string;
  start_date: string;
  end_date: string;
  admin_approval_status: string;
  is_published: boolean;
  schedules_count: number;
  classes: Class[];
}

const TeacherMarksEntry = ({ loading, setLoading }: any) => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const { getAllMarksData } = useSelector((state: any) => state.marks);
  
  // Extract exams from the data
  const exams: Exam[] = getAllMarksData?.exams || [];
  const [selectedExamId, setSelectedExamId] = useState<string | null>(
    exams.length > 0 ? exams[0].id : null
  );
  const [expandedExam, setExpandedExam] = useState<string | null>(
    exams.length > 0 ? exams[0].id : null
  );

  const getStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'approved': '#4CAF50',
      'pending': '#FFC107',
      'rejected': '#f44336'
    };
    return statusMap[status] || '#6c757d';
  };

  const getStatusIcon = (status: string) => {
    const iconMap: { [key: string]: string } = {
      'approved': 'checkmark-circle',
      'pending': 'time',
      'rejected': 'close-circle'
    };
    return iconMap[status] || 'ellipse';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleEnterMarks = (examId: any, classData: Class) => {
    // Navigate to marks entry with examId, classId, and sectionId
    console.log('Enter Marks for:', {
      examId,
      school_class_id: classData.school_class_id,
      section_id: classData.section_id,
      class_name: classData.class_name,
      section_name: classData.section_name
    });

     router.push({
      pathname: `screens/features/marksEntry/classExams/${examId}` as any,
      params: {
        classId: classData.school_class_id,
        sectionId: classData.section_id,
        className: classData.class_name,
        sectionName: classData.section_name,
        examId: examId // optional: add exam name if needed
      }
    })

  };

  const toggleExamExpand = (examId: string) => {
    setExpandedExam(expandedExam === examId ? null : examId);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Loading exams...</Text>
      </View>
    );
  }

  if (!exams || exams.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Ionicons name="school-outline" size={48} color={colors.textSecondary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No exams available
        </Text>
        <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
          You haven't been assigned to any exams yet
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            My Exams
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {exams.length} exam{exams.length > 1 ? 's' : ''} assigned
          </Text>
        </View>

        {/* Exam Cards */}
        {exams.map((exam) => (
          <View
            key={exam.id}
            style={[
              styles.examCard,
              { 
                backgroundColor: colors.card,
                borderColor: selectedExamId === exam.id ? colors.primary : 'transparent',
              }
            ]}
          >
            {/* Exam Header */}
            <TouchableOpacity
              style={styles.examHeaderMain}
              onPress={() => {
                setSelectedExamId(exam.id);
                toggleExamExpand(exam.id);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.examHeader}>
                <View style={styles.examTitleContainer}>
                  <Text style={[styles.examName, { color: colors.text }]}>
                    {exam.name}
                  </Text>
                  <View style={styles.statusBadgeContainer}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(exam.admin_approval_status) + '20' }]}>
                      <Ionicons 
                        name={getStatusIcon(exam.admin_approval_status)} 
                        size={14} 
                        color={getStatusColor(exam.admin_approval_status)} 
                      />
                      <Text style={[styles.statusText, { color: getStatusColor(exam.admin_approval_status) }]}>
                        {exam.admin_approval_status.charAt(0).toUpperCase() + exam.admin_approval_status.slice(1)}
                      </Text>
                    </View>
                    {exam.is_published && (
                      <View style={styles.publishedBadge}>
                        <Ionicons name="globe-outline" size={14} color="#4CAF50" />
                        <Text style={[styles.publishedText, { color: '#4CAF50' }]}>
                          Published
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <Ionicons 
                  name={expandedExam === exam.id ? 'chevron-up' : 'chevron-down'} 
                  size={24} 
                  color={colors.textSecondary} 
                />
              </View>

              <View style={styles.examDetails}>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                      {formatDate(exam.start_date)} - {formatDate(exam.end_date)}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="book-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                      {exam.schedules_count} schedule{exam.schedules_count > 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="school-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                      {exam.type_label}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                      {exam.classes?.length || 0} class{exam.classes?.length !== 1 ? 'es' : ''}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Classes Section - Expandable */}
            {expandedExam === exam.id && exam.classes && exam.classes.length > 0 && (
              <View style={styles.classesContainer}>
                <Text style={[styles.classesTitle, { color: colors.textSecondary }]}>
                  Classes & Sections
                </Text>
                {exam.classes.map((classItem, index) => (
                  <View 
                    key={`${classItem.school_class_id}-${classItem.section_id}`}
                    style={[
                      styles.classItem,
                      index < exam.classes.length - 1 && styles.classItemBorder,
                      { borderColor: colors.border || '#E0E0E0' }
                    ]}
                  >
                    <View style={styles.classInfo}>
                      <View style={styles.classNameContainer}>
                        <Text style={[styles.className, { color: colors.text }]}>
                          {classItem.class_name} - {classItem.section_name}
                        </Text>
                      </View>
                      <View style={styles.classStats}>
                        <View style={styles.statItem}>
                          <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
                          <Text style={[styles.statText, { color: colors.textSecondary }]}>
                            {classItem.student_count} students
                          </Text>
                        </View>
                        <View style={styles.statItem}>
                          <Ionicons name="checkmark-circle-outline" size={14} color={colors.textSecondary} />
                          <Text style={[styles.statText, { color: colors.textSecondary }]}>
                            {classItem.marks_entered}/{classItem.student_count} entered
                          </Text>
                        </View>
                        <View style={styles.statItem}>
                          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                          <Text style={[styles.statText, { color: colors.textSecondary }]}>
                            {classItem.schedule_count} schedule{classItem.schedule_count > 1 ? 's' : ''}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={[styles.enterMarksButton, { backgroundColor: colors.primary }]}
                      onPress={() => handleEnterMarks(exam.id, classItem)}
                    >
                      <Text style={styles.enterMarksButtonText}>
                        Enter Marks
                      </Text>
                      <Ionicons name="arrow-forward" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  examCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  examHeaderMain: {
    flex: 1,
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  examTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  examName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  statusBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  publishedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF5020',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  publishedText: {
    fontSize: 11,
    fontWeight: '500',
  },
  examDetails: {
    marginBottom: 8,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
  },
  classesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  classesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  classItem: {
    paddingVertical: 12,
  },
  classItemBorder: {
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 12,
  },
  classInfo: {
    marginBottom: 10,
  },
  classNameContainer: {
    marginBottom: 6,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
  },
  classStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
  },
  enterMarksButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  enterMarksButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default TeacherMarksEntry;