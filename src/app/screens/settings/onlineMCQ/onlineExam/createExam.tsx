import { View, Text, useColorScheme, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Colors } from '@/constants/theme'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { FullScreenLoader } from '@/hooks/use-screensLoder'

import { 
  getClassSectionTypesApiCall, 
  getExamQuestionsListApiCall, 
  publishExamApiCall,
  getExamListApiCall 
} from '@/redux/examSlice/teacherExamSlice'
import AddQuestionForm from '@/components/features/teachers/onlineExam/AddQuestionForm'
import QuestionList from '@/components/features/teachers/onlineExam/QuestionList'
import AddExamForm from '@/components/features/teachers/onlineExam/AddExamForm'
import HeaderSection from '@/components/features/header'

const CreateExam = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useLocalSearchParams();
  const urlExamId = params.examId as string;
  
  const { loading, classSectionTypes, examQuitionData, examList } = useSelector((state: any) => state.teacherExam)
  const [examCreated, setExamCreated] = useState(false)
  const [currentExamId, setCurrentExamId] = useState<string | null>(null)
  const [isEditingMode, setIsEditingMode] = useState(false)
  const [initialExamData, setInitialExamData] = useState<any>(null)
  const isPublished = examQuitionData?.exam?.is_published 
  

  useEffect(() => {
    getClassSectionTypesApiCall(dispatch)
    
    // If we have an examId in URL, we're in edit mode
    if (urlExamId) {
      setIsEditingMode(true)
      setCurrentExamId(urlExamId)
      setExamCreated(true)
      getExamQuestionsListApiCall(dispatch, urlExamId)
      
      // Load exam data from list
      const exam = examList?.exams?.find((e: any) => e.id === urlExamId)
      if (exam) {
        setInitialExamData({
          title: exam.title,
          subject_id: exam.subject_id,
          school_class_id: exam.school_class_id,
          section_id: exam.section_id,
          duration_minutes: exam.duration_minutes?.toString(),
          starts_at: exam.starts_at,
          ends_at: exam.ends_at,
          total_questions: exam.total_questions?.toString(),
          total_marks: exam.total_marks?.toString(),
          negative_marking: exam.negative_marking || false,
          negative_marks: exam.negative_marks?.toString(),
          shuffle_questions: exam.shuffle_questions || false,
          shuffle_options: exam.shuffle_options || false,
          fullscreen_required: exam.fullscreen_required || false,
          auto_submit: exam.auto_submit !== undefined ? exam.auto_submit : true,
          instructions: exam.instructions || '',
        })
      }
    }
  }, [dispatch, urlExamId, examList])

  const handleExamCreated = (newExamId: string) => {
    setCurrentExamId(newExamId)
    setExamCreated(true)
    setIsEditingMode(false)
    // Refresh exam list
    getExamListApiCall(dispatch)
  }

  const handlePublishExam = async () => {
    if (currentExamId) {
      const result = await publishExamApiCall(dispatch, currentExamId)
      if (result?.success) {
        router.back()
      }
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderSection title={isEditingMode ? "Edit Exam" : "Create Exam"} />
      
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {examCreated && !isEditingMode && (
          <TouchableOpacity onPress={handlePublishExam} style={styles.publishButton}>
            <Feather name="send" size={20} color="#fff" />
            <Text style={styles.publishButtonText}>Publish</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Exam Form */}
        { currentExamId ? null : 
        <AddExamForm 
        classSectionTypes={classSectionTypes} 
        onExamCreated={handleExamCreated}
        examId={currentExamId || undefined}
        isEditing={isEditingMode}
        initialData={initialExamData}
        />
      }

        {/* Show Question Form and List only after exam is created */}
        { currentExamId && (
          <>
          
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Questions</Text>
              <View style={styles.dividerLine} />
            </View>
             { isPublished === true ? null              
              :
              <AddQuestionForm 
              examId={currentExamId} 
              questionTypes={classSectionTypes?.question_types || []}
              />
            }
            
            <QuestionList 
              examId={currentExamId}
              questions={examQuitionData?.questions || []}
              totalQuestions={examQuitionData?.questions?.length || 0}
              isReadOnly={isEditingMode}
            />
          </>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 0,
    borderBottomWidth: 1,
  },
  publishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
})

export default CreateExam