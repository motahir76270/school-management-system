import { View, Text, useColorScheme, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, TextInput } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import HeaderSection from '@/components/features/header'
import { FullScreenLoader } from '@/hooks/use-screensLoder'
import { Colors } from '@/constants/theme'
import { useDispatch, useSelector } from 'react-redux'
import { getExamResportListApiCall } from '@/redux/examSlice/teacherExamSlice'
import { Feather } from '@expo/vector-icons'
import { router } from 'expo-router'

const Report = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const { examReportsList, loading } = useSelector((state: any) => state.teacherExam);
  const dispatch = useDispatch()
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredExams, setFilteredExams] = useState([])

  useEffect(() => {
    getExamResportListApiCall(dispatch)
  }, [])

  useEffect(() => {
    if (examReportsList?.exams) {
      const filtered = examReportsList.exams.filter((exam: any) =>
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.section.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredExams(filtered)
    }
  }, [searchQuery, examReportsList])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    getExamResportListApiCall(dispatch)
    setRefreshing(false)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50'
      case 'expired':
        return '#FF3B30'
      case 'upcoming':
        return '#FF9500'
      default:
        return '#666'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ongoing'
      case 'expired':
        return 'Completed'
      case 'upcoming':
        return 'Upcoming'
      default:
        return status
    }
  }

  const handleExamPress = (examId: string) => {
    router.push(`/screens/settings/onlineMCQ/examReport/${examId}`)
  }

  const renderExamCard = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.examCard, { backgroundColor: colors.card || '#fff' }]}
      onPress={() => handleExamPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.examHeader}>
        <View style={styles.examTitleContainer}>
          <Text style={[styles.examTitle, { color: colors.text || '#333' }]}>
            {item.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>
        <Feather name="chevron-right" size={20} color={colors.text || '#666'} />
      </View>

      <View style={styles.examDetails}>
        <View style={styles.detailItem}>
          <Feather name="book" size={14} color={colors.text || '#666'} />
          <Text style={[styles.detailText, { color: colors.text || '#666' }]}>
            {item.subject}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Feather name="users" size={14} color={colors.text || '#666'} />
          <Text style={[styles.detailText, { color: colors.text || '#666' }]}>
            {item.class} - {item.section}
          </Text>
        </View>
      </View>

      <View style={styles.examMeta}>
        <View style={styles.metaItem}>
          <Feather name="clock" size={14} color={colors.text || '#666'} />
          <Text style={[styles.metaText, { color: colors.text || '#666' }]}>
            {item.duration_minutes}m
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="file-text" size={14} color={colors.text || '#666'} />
          <Text style={[styles.metaText, { color: colors.text || '#666' }]}>
            {item.total_questions} Qs
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="calendar" size={14} color={colors.text || '#666'} />
          <Text style={[styles.metaText, { color: colors.text || '#666' }]}>
            {item.starts_at_label}
          </Text>
        </View>
      </View>

      <View style={styles.reportSummary}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.text || '#666' }]}>Attempts</Text>
          <Text style={[styles.summaryValue, { color: colors.text || '#333' }]}>
            {item.report.total_attempts || 0}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.text || '#666' }]}>Avg Score</Text>
          <Text style={[styles.summaryValue, { color: colors.text || '#333' }]}>
            {item.report.avg_score || 0}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.text || '#666' }]}>Pass/Fail</Text>
          <Text style={[styles.summaryValue, { color: colors.text || '#333' }]}>
            {item.report.pass_count || 0}/{item.report.fail_count || 0}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.text || '#666' }]}>Highest</Text>
          <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
            {item.report.highest || 0}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.background || '#f5f5f5' }]}>
      <HeaderSection title="Exam Reports" />

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.card || '#fff' }]}>
          <Feather name="search" size={20} color={colors.text || '#666'} />
          <TextInput
            style={[styles.searchInput, { color: colors.text || '#333' }]}
            placeholder="Search exams..."
            placeholderTextColor={colors.text || '#999'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={20} color={colors.text || '#666'} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary || '#4CAF50']} />
        }
      >
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card || '#fff' }]}>
            <Text style={[styles.statNumber, { color: colors.text || '#333' }]}>
              {examReportsList?.count || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text || '#666' }]}>Total Exams</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card || '#fff' }]}>
            <Text style={[styles.statNumber, { color: colors.text || '#333' }]}>
              {examReportsList?.exams?.filter((e: any) => e.status === 'active').length || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text || '#666' }]}>Ongoing</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card || '#fff' }]}>
            <Text style={[styles.statNumber, { color: colors.text || '#333' }]}>
              {examReportsList?.exams?.filter((e: any) => e.status === 'expired').length || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text || '#666' }]}>Completed</Text>
          </View>
        </View>

        {filteredExams.length > 0 ? (
          <View style={styles.listContainer}>
            {filteredExams.map((exam: any) => (
              <View key={exam.id}>
                {renderExamCard({ item: exam })}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="file-text" size={60} color={colors.text || '#ccc'} />
            <Text style={[styles.emptyTitle, { color: colors.text || '#333' }]}>
              {searchQuery ? 'No results found' : 'No exams available'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.text || '#666' }]}>
              {searchQuery ? 'Try adjusting your search' : 'Create exams to see reports here'}
            </Text>
          </View>
        )}
      </ScrollView>

      <FullScreenLoader loading={loading} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    padding: 0,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  examCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  examTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  examTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  examDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
  },
  examMeta: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  reportSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#f0f0f0',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
  },
})

export default Report