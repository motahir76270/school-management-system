import { View, Text, useColorScheme, Alert, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import HeaderSection from '@/components/features/header'
import { FullScreenLoader } from '@/hooks/use-screensLoder'
import { Colors } from '@/constants/theme'
import { setReportData } from '@/redux/studentSlice'
import { useLocalSearchParams, router } from 'expo-router'
import { useDispatch, useSelector } from 'react-redux'
import { getStudentsReportsById } from '@/hooks/apiCalls/student'
import { Ionicons } from '@expo/vector-icons'

interface Subject {
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

interface Summary {
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
}

interface ReportData {
  success: boolean;
  message: string;
  print_url: string;
  report_card: {
    exam_id: string;
    exam_name: string;
    exam_type: string;
    type_label: string;
    start_date: string;
    end_date: string;
    summary: Summary;
    subjects: Subject[];
    session: string;
    school: {
      name: string;
      logo_url: string;
      address: string;
      phone: string;
    };
    student: {
      id: string;
      name: string;
      student_id: string;
      admission_no: string;
      roll_no: string;
      class: string;
      section: string;
    };
  };
}

const UserReportsScreen = () => {
  const [Loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const { id } = useLocalSearchParams();
  
  const { reportsData } = useSelector((state: any) => state.student);
  

  const fetchReportsDataById = async () => {
    setLoading(true);
    try {
      const res = await getStudentsReportsById(id);
      if (res?.success === true) {
        dispatch(setReportData(res))
      } else {
        Alert.alert("Failed", res?.message || "Failed to fetch report")
      }
    } catch (error) {
      Alert.alert("Failed", "Server Not Responding! Please Check Internet Connection")
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReportsDataById()
  }, []);

  const reportData: ReportData = reportsData;
  const report = reportData?.report_card;

  const getStatusColor = (status: string) => {
    return status === 'Pass' ? colors.success : colors.error;
  }

  const getGradeColor = (grade: string) => {
    if (!grade) return colors.textSecondary;
    if (grade.startsWith('A')) return '#4CAF50';
    if (grade.startsWith('B')) return '#2196F3';
    if (grade.startsWith('C')) return '#FF9800';
    if (grade.startsWith('D')) return '#F44336';
    return colors.textSecondary;
  }

  const handlePrintPDF = () => {
    if (reportData?.print_url) {
      router.push(`screens/features/reportsCard/card/${reportData.print_url}` as any );
    } else {
      Alert.alert("Error", "Print URL not available");
    }
  }

  if (!report) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <HeaderSection title="Reports" />
        <View style={styles.centerContainer}>
          <Ionicons name="document-text-outline" size={60} color={colors.textSecondary} />
          <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
            No report data available
          </Text>
        </View>
        <FullScreenLoader loading={Loading} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderSection title="Reports" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* School Header */}
        <View style={[styles.schoolHeader, { backgroundColor: colors.backgroundElement }]}>
          {report.school.logo_url && (
            <Image 
              source={{ uri: report.school.logo_url }} 
              style={styles.schoolLogo}
              resizeMode="contain"
            />
          )}
          <View style={styles.schoolInfo}>
            <Text style={[styles.schoolName, { color: colors.textPrimary }]}>
              {report.school.name}
            </Text>
            <Text style={[styles.schoolAddress, { color: colors.textSecondary }]}>
              {report.school.address}
            </Text>
            <Text style={[styles.schoolPhone, { color: colors.textSecondary }]}>
              📞 {report.school.phone}
            </Text>
          </View>
        </View>

        {/* Student Info */}
        <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Student Information
          </Text>
          <View style={styles.row}>
            <View style={styles.infoItem}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Student Name</Text>
              <Text style={[styles.value, { color: colors.textPrimary }]}>{report.student.name}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Roll No</Text>
              <Text style={[styles.value, { color: colors.textPrimary }]}>{report.student.roll_no}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.infoItem}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Class</Text>
              <Text style={[styles.value, { color: colors.textPrimary }]}>{report.student.class} - {report.student.section}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Session</Text>
              <Text style={[styles.value, { color: colors.textPrimary }]}>{report.session}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.infoItem}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Exam</Text>
              <Text style={[styles.value, { color: colors.textPrimary }]}>{report.exam_name}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Type</Text>
              <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.badgeText, { color: colors.primary }]}>{report.type_label}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Performance Summary
          </Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Percentage</Text>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>
                {report.summary.percentage.toFixed(2)}%
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Grade</Text>
              <Text style={[styles.summaryValue, { color: getGradeColor(report.summary.grade) }]}>
                {report.summary.grade}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Status</Text>
              <Text style={[styles.summaryValue, { color: getStatusColor(report.summary.status) }]}>
                {report.summary.status}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Rank</Text>
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                #{report.summary.rank}
              </Text>
            </View>
          </View>
          <View style={styles.summaryFooter}>
            <View style={styles.summaryFooterItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Obtained</Text>
              <Text style={[styles.summaryFooterValue, { color: colors.textPrimary }]}>
                {report.summary.total_obtained} / {report.summary.total_max}
              </Text>
            </View>
            <View style={styles.summaryFooterItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Attendance</Text>
              <Text style={[styles.summaryFooterValue, { color: colors.textPrimary }]}>
                {report.summary.attendance_rate}%
              </Text>
            </View>
          </View>
        </View>

        {/* Subjects Table */}
        <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Subject-wise Marks
          </Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { color: colors.textSecondary, flex: 2 }]}>Subject</Text>
            <Text style={[styles.tableHeaderText, { color: colors.textSecondary, flex: 1 }]}>Obtained</Text>
            <Text style={[styles.tableHeaderText, { color: colors.textSecondary, flex: 1 }]}>Max</Text>
            <Text style={[styles.tableHeaderText, { color: colors.textSecondary, flex: 1 }]}>Grade</Text>
          </View>
          {report.subjects.map((subject, index) => (
            <View 
              key={subject.subject_id} 
              style={[
                styles.tableRow,
                index % 2 === 0 && { backgroundColor: colors.backgroundSelected }
              ]}
            >
              <Text style={[styles.tableCell, { color: colors.textPrimary, flex: 2 }]}>
                {subject.subject_name.toUpperCase()}
              </Text>
              <Text style={[styles.tableCell, { color: colors.textPrimary, flex: 1 }]}>
                {subject.marks_obtained}
              </Text>
              <Text style={[styles.tableCell, { color: colors.textPrimary, flex: 1 }]}>
                {subject.max_marks}
              </Text>
              <Text style={[styles.tableCell, { color: getGradeColor(subject.grade), flex: 1 }]}>
                {subject.grade}
              </Text>
            </View>
          ))}
        </View>

      </ScrollView>
      <FullScreenLoader loading={Loading} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 130,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  noDataText: {
    fontSize: 16,
    marginTop: 10,
  },
  schoolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  schoolLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  schoolAddress: {
    fontSize: 14,
    marginBottom: 2,
  },
  schoolPhone: {
    fontSize: 14,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoItem: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  summaryItem: {
    width: '50%',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  summaryFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
  },
  summaryFooterItem: {
    flex: 1,
  },
  summaryFooterValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 4,
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  tableCell: {
    fontSize: 14,
    fontWeight: '400',
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  pdfButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default UserReportsScreen;