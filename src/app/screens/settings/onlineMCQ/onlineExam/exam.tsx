import { View, Text, useColorScheme, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import HeaderSection from '@/components/features/header'
import { Colors } from '@/constants/theme'
import { useDispatch, useSelector } from 'react-redux'
import { deleteExamApiCall, getExamListApiCall } from '@/redux/examSlice/teacherExamSlice'
import { FullScreenLoader } from '@/hooks/use-screensLoder'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Alert } from 'react-native'

const ExamScreens = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const { examList, loading } = useSelector((state: any) => state.teacherExam)
  
  const dispatch = useDispatch();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getExamListApiCall(dispatch)
  }, [dispatch])

  const onRefresh = async () => {
    setRefreshing(true);
    await getExamListApiCall(dispatch);
    setRefreshing(false);
  }

  const handleDeleteExam = (examId: string, examTitle: string) => {
    Alert.alert(
      "Delete Exam",
      `Are you sure you want to delete "${examTitle}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => deleteExamApiCall(dispatch, examId)
        }
      ]
    )
  }

  const renderExamItem = ({ item }: any) => (
    <TouchableOpacity 
      style={[styles.examCard, { backgroundColor: colors.card }]}
      onPress={() => router.push({
        pathname: '/screens/settings/onlineMCQ/onlineExam/createExam',
        params: { examId: item.id }
      })}
    >
      <View style={styles.examHeader}>
        <Text style={[styles.examTitle, { color: colors.text }]}>{item.title}</Text>
        <View style={[styles.statusBadge, { 
          backgroundColor: item.status === 'active' ? '#4CAF50' : '#FF9800' 
        }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.examDetails}>
        <Text style={[styles.detailText, { color: colors.textSecondary }]}>
          <Feather name="book" size={14} color={colors.textSecondary} /> {item.subject}
        </Text>
        <Text style={[styles.detailText, { color: colors.textSecondary }]}>
          <Feather name="users" size={14} color={colors.textSecondary} /> {item.class} - {item.section}
        </Text>
      </View>
      
      <View style={styles.examStats}>
        <Text style={[styles.statText, { color: colors.textSecondary }]}>
          <Feather name="clock" size={12} color={colors.textSecondary} /> {item.duration_minutes}m
        </Text>
        <Text style={[styles.statText, { color: colors.textSecondary }]}>
          <Feather name="check-circle" size={12} color={colors.textSecondary} /> {item.questions_count} Qs
        </Text>
        <Text style={[styles.statText, { color: colors.textSecondary }]}>
          <Feather name="users" size={12} color={colors.textSecondary} /> {item.attempts_count} attempts
        </Text>
      </View>
      
      <View style={styles.examFooter}>
        <Text style={[styles.dateText, { color: colors.textSecondary }]}>
          {item.starts_at_label} - {item.ends_at_label}
        </Text>
        <TouchableOpacity 
          onPress={() => handleDeleteExam(item.id, item.title)}
          style={styles.deleteButton}
        >
          <Feather name="trash-2" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderSection title="Online Exam" />
      <View style={styles.content}>
        <TouchableOpacity 
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/screens/settings/onlineMCQ/onlineExam/createExam')}
        >
          <Feather name="plus-circle" size={24} color="#fff" />
          <Text style={styles.createButtonText}>Create New Exam</Text>
        </TouchableOpacity>
        
        {examList?.exams && examList.exams.length > 0 ? (
          <FlatList
            data={examList.exams}
            renderItem={renderExamItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="file-text" size={64} color={colors.textPrimary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No exams created yet
            </Text>
            <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
              Tap the "Create New Exam" button to get started
            </Text>
          </View>
        )}
      </View>
      <FullScreenLoader loading={loading} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
    gap: 10,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  examCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  examTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  examDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
  },
  examStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  statText: {
    fontSize: 12,
  },
  examFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
  },
  dateText: {
    fontSize: 12,
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
  },
})

export default ExamScreens