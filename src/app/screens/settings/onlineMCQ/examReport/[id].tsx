import { View, Text, useColorScheme, StyleSheet, ScrollView, TouchableOpacity, SectionList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Colors } from '@/constants/theme'
import HeaderSection from '@/components/features/header'
import { FullScreenLoader } from '@/hooks/use-screensLoder'
import { getExamResportByIdApiCall } from '@/redux/examSlice/teacherExamSlice'
import { useLocalSearchParams, router } from 'expo-router'
import { Feather, Ionicons } from '@expo/vector-icons'

const ExamReportStudent = () => {
  const scheme = useColorScheme()
  const dispatch = useDispatch()
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme]
  const { examReport, loading } = useSelector((state: any) => state.teacherExam)
  const { id } = useLocalSearchParams()
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'attendance' | 'analysis'>('leaderboard')

  useEffect(() => {
    if (id) {
      getExamResportByIdApiCall(dispatch, id)
    }
  }, [id])

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return '#4CAF50'
      case 'B': return '#8BC34A'
      case 'C': return '#FFC107'
      case 'D': return '#FF9800'
      case 'F': return '#FF3B30'
      default: return '#666'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return '#4CAF50'
      case 'pending': return '#FF9800'
      case 'absent': return '#FF3B30'
      default: return '#666'
    }
  }

  const handleStudentPress = (attemptId: string) => {
    router.push(`/screens/settings/onlineMCQ/examReport/answersheet/${id}?attemptId=${attemptId}`)
  }

  const renderLeaderboardItem = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.leaderboardItem, { backgroundColor: colors.card || '#fff' }]}
      onPress={() => handleStudentPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.leaderboardRank}>
        <Text style={[styles.rankText, { color: colors.text || '#333' }]}>
          #{item.rank || 0}
        </Text>
      </View>
      <View style={styles.leaderboardInfo}>
        <Text style={[styles.studentName, { color: colors.text || '#333' }]}>
          {item.student_name}
        </Text>
        <Text style={[styles.studentScore, { color: colors.text || '#666' }]}>
          Score: {item.score} | Percentage: {item.percentage}%
        </Text>
      </View>
      <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(item.grade) + '20' }]}>
        <Text style={[styles.gradeText, { color: getGradeColor(item.grade) }]}>
          {item.grade}
        </Text>
      </View>
      <Feather name="chevron-right" size={20} color={colors.text || '#666'} />
    </TouchableOpacity>
  )

  const renderAttendanceItem = ({ item }: any) => (
    <View style={[styles.attendanceItem, { backgroundColor: colors.card || '#fff' }]}>
      <View style={styles.attendanceInfo}>
        <Text style={[styles.studentName, { color: colors.text || '#333' }]}>
          {item.student.full_name}
        </Text>
        <Text style={[styles.studentRoll, { color: colors.text || '#666' }]}>
          Roll: {item.student.roll_no} | {item.student.student_id}
        </Text>
      </View>
      <View style={styles.attendanceStatus}>
        <View style={[
          styles.attendanceBadge,
          { backgroundColor: item.attended ? '#4CAF5020' : '#FF3B3020' }
        ]}>
          <View style={[
            styles.attendanceDot,
            { backgroundColor: item.attended ? '#4CAF50' : '#FF3B30' }
          ]} />
          <Text style={[
            styles.attendanceText,
            { color: item.attended ? '#4CAF50' : '#FF3B30' }
          ]}>
            {item.attended ? 'Present' : 'Absent'}
          </Text>
        </View>
        {item.submitted && (
          <View style={[styles.submittedBadge, { backgroundColor: '#4CAF5020' }]}>
            <Feather name="check-circle" size={12} color="#4CAF50" />
            <Text style={[styles.submittedText, { color: '#4CAF50' }]}>
              Submitted
            </Text>
          </View>
        )}
      </View>
    </View>
  )

  const renderAnalysisItem = ({ item }: any) => (
    <View style={[styles.analysisItem, { backgroundColor: colors.card || '#fff' }]}>
      <View style={styles.analysisHeader}>
        <Text style={[styles.analysisQuestion, { color: colors.text || '#333' }]}>
          Q{item.sort_order || 0}: {item.question}
        </Text>
        <Text style={[styles.analysisMarks, { color: colors.text || '#666' }]}>
          {item.marks} marks
        </Text>
      </View>
      <View style={styles.analysisStats}>
        <View style={styles.analysisStat}>
          <Text style={[styles.analysisStatLabel, { color: colors.text || '#666' }]}>Attempts</Text>
          <Text style={[styles.analysisStatValue, { color: colors.text || '#333' }]}>
            {item.attempts || 0}
          </Text>
        </View>
        <View style={styles.analysisStat}>
          <Text style={[styles.analysisStatLabel, { color: colors.text || '#666' }]}>Answered</Text>
          <Text style={[styles.analysisStatValue, { color: colors.text || '#333' }]}>
            {item.answered || 0}
          </Text>
        </View>
        <View style={styles.analysisStat}>
          <Text style={[styles.analysisStatLabel, { color: colors.text || '#666' }]}>Correct</Text>
          <Text style={[styles.analysisStatValue, { color: '#4CAF50' }]}>
            {item.correct || 0}
          </Text>
        </View>
        <View style={styles.analysisStat}>
          <Text style={[styles.analysisStatLabel, { color: colors.text || '#666' }]}>Accuracy</Text>
          <Text style={[styles.analysisStatValue, { color: colors.text || '#333' }]}>
            {item.accuracy || 0}%
          </Text>
        </View>
      </View>
      <View style={styles.accuracyBar}>
        <View style={[
          styles.accuracyFill,
          { width: `${item.accuracy || 0}%`, backgroundColor: item.accuracy > 70 ? '#4CAF50' : item.accuracy > 40 ? '#FFC107' : '#FF3B30' }
        ]} />
      </View>
    </View>
  )

  const examData = examReport?.exam
  const reportData = examReport?.report
  const leaderboard = examReport?.leaderboard || []
  const attendance = examReport?.attendance || []
  const questionAnalysis = examReport?.question_analysis || []

  return (
    <View style={[styles.container, { backgroundColor: colors.background || '#f5f5f5' }]}>
      <HeaderSection title="Exam Report" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Exam Info Card */}
        {examData && (
          <View style={[styles.examInfoCard, { backgroundColor: colors.card || '#fff' }]}>
            <Text style={[styles.examTitle, { color: colors.text || '#333' }]}>
              {examData.title}
            </Text>
            <View style={styles.examInfoGrid}>
              <View style={styles.examInfoItem}>
                <Feather name="book" size={16} color={colors.text || '#666'} />
                <Text style={[styles.examInfoText, { color: colors.text || '#666' }]}>
                  {examData.subject}
                </Text>
              </View>
              <View style={styles.examInfoItem}>
                <Feather name="users" size={16} color={colors.text || '#666'} />
                <Text style={[styles.examInfoText, { color: colors.text || '#666' }]}>
                  {examData.class} - {examData.section}
                </Text>
              </View>
              <View style={styles.examInfoItem}>
                <Feather name="clock" size={16} color={colors.text || '#666'} />
                <Text style={[styles.examInfoText, { color: colors.text || '#666' }]}>
                  {examData.duration_minutes}m
                </Text>
              </View>
              <View style={styles.examInfoItem}>
                <Feather name="file-text" size={16} color={colors.text || '#666'} />
                <Text style={[styles.examInfoText, { color: colors.text || '#666' }]}>
                  {examData.total_questions} Qs
                </Text>
              </View>
            </View>
            <View style={styles.examDates}>
              <View style={styles.dateItem}>
                <Text style={[styles.dateLabel, { color: colors.text || '#666' }]}>Starts</Text>
                <Text style={[styles.dateValue, { color: colors.text || '#333' }]}>
                  {examData.starts_at_label}
                </Text>
              </View>
              <View style={styles.dateItem}>
                <Text style={[styles.dateLabel, { color: colors.text || '#666' }]}>Ends</Text>
                <Text style={[styles.dateValue, { color: colors.text || '#333' }]}>
                  {examData.ends_at_label}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Report Summary */}
        {reportData && (
          <View style={[styles.reportSummaryCard, { backgroundColor: colors.card || '#fff' }]}>
            <Text style={[styles.sectionTitle, { color: colors.text || '#333' }]}>
              Report Summary
            </Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: colors.text || '#333' }]}>
                  {reportData.total_attempts || 0}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.text || '#666' }]}>Attempts</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: colors.text || '#333' }]}>
                  {reportData.avg_score || 0}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.text || '#666' }]}>Avg Score</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: colors.text || '#333' }]}>
                  {reportData.avg_percentage || 0}%
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.text || '#666' }]}>Avg %</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: '#4CAF50' }]}>
                  {reportData.pass_count || 0}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.text || '#666' }]}>Passed</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: '#FF3B30' }]}>
                  {reportData.fail_count || 0}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.text || '#666' }]}>Failed</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: '#4CAF50' }]}>
                  {reportData.highest || 0}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.text || '#666' }]}>Highest</Text>
              </View>
            </View>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'leaderboard' && styles.activeTab, { borderBottomColor: activeTab === 'leaderboard' ? colors.primary || '#4CAF50' : 'transparent' }]}
            onPress={() => setActiveTab('leaderboard')}
          >
            <Ionicons  name="trophy-outline" size={18} color={activeTab === 'leaderboard' ? colors.primary || '#4CAF50' : colors.text || '#666'} />
            <Text style={[styles.tabText, { color: activeTab === 'leaderboard' ? colors.primary || '#4CAF50' : colors.text || '#666' }]}>
              Leaderboard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'attendance' && styles.activeTab, { borderBottomColor: activeTab === 'attendance' ? colors.primary || '#4CAF50' : 'transparent' }]}
            onPress={() => setActiveTab('attendance')}
          >
            <Feather name="users" size={18} color={activeTab === 'attendance' ? colors.primary || '#4CAF50' : colors.text || '#666'} />
            <Text style={[styles.tabText, { color: activeTab === 'attendance' ? colors.primary || '#4CAF50' : colors.text || '#666' }]}>
              Attendance
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'analysis' && styles.activeTab, { borderBottomColor: activeTab === 'analysis' ? colors.primary || '#4CAF50' : 'transparent' }]}
            onPress={() => setActiveTab('analysis')}
          >
            <Feather name="bar-chart-2" size={18} color={activeTab === 'analysis' ? colors.primary || '#4CAF50' : colors.text || '#666'} />
            <Text style={[styles.tabText, { color: activeTab === 'analysis' ? colors.primary || '#4CAF50' : colors.text || '#666' }]}>
              Analysis
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'leaderboard' && (
            <View style={styles.leaderboardList}>
              {leaderboard.length > 0 ? (
                leaderboard.map((item: any, index: number) => (
                  <View key={item.id}>
                    {renderLeaderboardItem({ item: { ...item, rank: index + 1 } })}
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="trophy-outline" size={40} color={colors.text || '#ccc'} />
                  <Text style={[styles.emptyStateText, { color: colors.text || '#666' }]}>
                    No leaderboard data available
                  </Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'attendance' && (
            <View style={styles.attendanceList}>
              {attendance.length > 0 ? (
                attendance.map((item: any, index: number) => (
                  <View key={index}>
                    {renderAttendanceItem({ item })}
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Feather name="users" size={40} color={colors.text || '#ccc'} />
                  <Text style={[styles.emptyStateText, { color: colors.text || '#666' }]}>
                    No attendance data available
                  </Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'analysis' && (
            <View style={styles.analysisList}>
              {questionAnalysis.length > 0 ? (
                questionAnalysis.map((item: any, index: number) => (
                  <View key={item.question_id}>
                    {renderAnalysisItem({ item: { ...item, sort_order: index + 1 } })}
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Feather name="bar-chart-2" size={40} color={colors.text || '#ccc'} />
                  <Text style={[styles.emptyStateText, { color: colors.text || '#666' }]}>
                    No analysis data available
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <FullScreenLoader loading={loading} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  examInfoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  examTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  examInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  examInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  examInfoText: {
    fontSize: 14,
  },
  examDates: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  reportSummaryCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    minWidth: '28%',
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabContent: {
    marginBottom: 20,
  },
  leaderboardList: {
    gap: 8,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  leaderboardRank: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '600',
  },
  leaderboardInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '500',
  },
  studentScore: {
    fontSize: 12,
    marginTop: 2,
  },
  gradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  gradeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  attendanceList: {
    gap: 8,
  },
  attendanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  attendanceInfo: {
    flex: 1,
  },
  studentRoll: {
    fontSize: 12,
    marginTop: 2,
  },
  attendanceStatus: {
    alignItems: 'flex-end',
    gap: 4,
  },
  attendanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  attendanceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  attendanceText: {
    fontSize: 12,
    fontWeight: '500',
  },
  submittedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  submittedText: {
    fontSize: 11,
    fontWeight: '500',
  },
  analysisList: {
    gap: 8,
  },
  analysisItem: {
    padding: 12,
    borderRadius: 8,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  analysisQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  analysisMarks: {
    fontSize: 12,
  },
  analysisStats: {
    flexDirection: 'row',
    gap: 16,
  },
  analysisStat: {
    flex: 1,
  },
  analysisStatLabel: {
    fontSize: 11,
  },
  analysisStatValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  accuracyBar: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  accuracyFill: {
    height: '100%',
    borderRadius: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    marginTop: 12,
  },
})

export default ExamReportStudent