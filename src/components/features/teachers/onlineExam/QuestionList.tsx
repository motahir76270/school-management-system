import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import React from 'react'
import { Feather } from '@expo/vector-icons'
import { useDispatch, useSelector } from 'react-redux'
import { deleteExamQuestionsApiCall, publishExamApiCall } from '@/redux/examSlice/teacherExamSlice'
import { router } from 'expo-router'

interface QuestionListProps {
  examId: string
  questions: any[]
  totalQuestions: number
  isReadOnly?: boolean
}

const QuestionList = ({ examId, questions, totalQuestions, isReadOnly = false }: QuestionListProps) => {
  const dispatch = useDispatch()
  const { examQuitionData, loading } = useSelector((state: any) => state.teacherExam)
  
  const questionList = examQuitionData?.exam?.questions || questions || []
  const totalQ = examQuitionData?.exam?.questions_count || totalQuestions || 0
  const examData = examQuitionData?.exam || {}
  const isPublished = examData?.is_published || false
  const examStatus = examData?.status || 'draft'

  const handleDeleteQuestion = (questionId: string) => {
    if (isReadOnly) return
    
    Alert.alert(
      'Delete Question',
      'Are you sure you want to delete this question?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteExamQuestionsApiCall(dispatch, examId, questionId)
        }
      ]
    )
  }

  const handlePublishExam = () => {
   
    Alert.alert(
      'Publish Exam',
      'Are you sure you want to publish this exam? Students will be able to access it once published.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Publish', 
          style: 'default',
          onPress: async () => {
            const result = await publishExamApiCall(dispatch, examId)
            
            if (result?.success == true) {
              router.push('/screens/settings/onlineMCQ/onlineExam/exam')
            }
          }
        }
      ]
    )
  }

  const getQuestionTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'mcq_single': 'MCQ (Single)',
      'mcq_multiple': 'MCQ (Multiple)',
      'fill_blank': 'Fill in the Blank',
      'true_false': 'True/False',
      'short_answer': 'Short Answer'
    }
    return types[type] || type
  }

  const getOptionLabel = (index: number) => {
    return String.fromCharCode(65 + index)
  }

  const renderQuestionItem = ({ item, index }: any) => (
    <View style={styles.questionCard}>
      <View style={styles.questionHeader}>
        <View style={styles.questionNumberContainer}>
          <Text style={styles.questionNumber}>Q{index + 1}</Text>
        </View>
        <View style={styles.questionContent}>
          <Text style={styles.questionText}>{item.question}</Text>
          <View style={styles.questionMeta}>
            <View style={styles.metaBadge}>
              <Feather name="tag" size={12} color="#666" />
              <Text style={styles.metaText}>{getQuestionTypeLabel(item.question_type)}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Feather name="star" size={12} color="#666" />
              <Text style={styles.metaText}>{item.marks} mark{item.marks > 1 ? 's' : ''}</Text>
            </View>
          </View>
        </View>
      </View>

      {item.options && item.options.length > 0 && (
        <View style={styles.optionsContainer}>
          <Text style={styles.optionsLabel}>Options:</Text>
          {item.options.map((option: string, optIndex: number) => {
            const label = getOptionLabel(optIndex)
            const isCorrect = item.correct_answer === label
            return (
              <View key={optIndex} style={styles.optionRow}>
                <View style={[styles.optionBullet, isCorrect && styles.correctBullet]}>
                  {isCorrect && <Feather name="check" size={10} color="#fff" />}
                </View>
                <Text style={[styles.optionText, isCorrect && styles.correctOptionText]}>
                  {label}. {option}
                  {isCorrect && <Text style={styles.correctLabel}> ✓ Correct</Text>}
                </Text>
              </View>
            )
          })}
        </View>
      )}

      {!isReadOnly && (
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteQuestion(item.id)}
          disabled={isPublished}
        >
          <Feather 
            name="trash-2" 
            size={18} 
            color={isPublished ? '#ccc' : '#FF3B30'} 
          />
        </TouchableOpacity>
      )}
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>
            <Feather name="list" size={20} color="#333" /> Questions ({totalQ})
          </Text>
          {isPublished && (
            <View style={styles.publishedBadge}>
              <Feather name="check-circle" size={14} color="#4CAF50" />
              <Text style={styles.publishedText}>Published</Text>
            </View>
          )}
        </View>
        {isReadOnly && (
          <TouchableOpacity 
            style={[
              styles.publishButton,
              (isPublished || totalQ === 0) && styles.publishButtonDisabled
            ]}
            onPress={handlePublishExam}
            disabled={totalQ === 0 || loading}
          >
            <Feather 
              name={isPublished ? "check-circle" : "send"} 
              size={18} 
              color={isPublished || totalQ === 0 ? '#999' : '#fff'} 
            />
            <Text style={[
              styles.publishButtonText,
              (isPublished || totalQ === 0) && styles.publishButtonTextDisabled
            ]}>
              {isPublished ? 'Published' : 'Publish Exam'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Exam Info Bar */}
      <View style={styles.examInfoBar}>
        <View style={styles.infoItem}>
          <Feather name="clock" size={14} color="#666" />
          <Text style={styles.infoText}>{examData.duration_minutes || 0} mins</Text>
        </View>
        <View style={styles.infoItem}>
          <Feather name="file-text" size={14} color="#666" />
          <Text style={styles.infoText}>{totalQ} Questions</Text>
        </View>
        <View style={styles.infoItem}>
          <Feather name="star" size={14} color="#666" />
          <Text style={styles.infoText}>{examData.total_marks || 0} Marks</Text>
        </View>
        <View style={[styles.statusBadge, 
          examStatus === 'published' ? styles.statusPublished : 
          examStatus === 'active' ? styles.statusActive : 
          styles.statusDraft
        ]}>
          <Text style={styles.statusText}>
            {examStatus?.toUpperCase() || 'DRAFT'}
          </Text>
        </View>
      </View>

      {questionList && questionList.length > 0 ? (
        <FlatList
          data={questionList}
          renderItem={renderQuestionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Feather name="file-text" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No questions added yet</Text>
          {!isReadOnly && (
            <Text style={styles.emptySubText}>Add questions using the form above</Text>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  publishedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  publishedText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '500',
  },
  publishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  publishButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  publishButtonTextDisabled: {
    color: '#999',
  },
  examInfoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  statusDraft: {
    backgroundColor: '#FFF3E0',
  },
  statusPublished: {
    backgroundColor: '#E8F5E9',
  },
  statusActive: {
    backgroundColor: '#E3F2FD',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  listContent: {
    gap: 12,
  },
  questionCard: {
    backgroundColor: '#f8f9fa',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    position: 'relative',
  },
  questionHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  questionNumberContainer: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976D2',
  },
  questionContent: {
    flex: 1,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
    lineHeight: 20,
  },
  questionMeta: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#666',
  },
  optionsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
  },
  optionsLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 6,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 3,
  },
  optionBullet: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  correctBullet: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  optionText: {
    fontSize: 13,
    color: '#555',
    flex: 1,
  },
  correctOptionText: {
    color: '#2E7D32',
    fontWeight: '500',
  },
  correctLabel: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 11,
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFEBEE',
    borderRadius: 6,
    padding: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
  },
})

export default QuestionList