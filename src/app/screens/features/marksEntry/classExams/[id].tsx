import { View, Text, Alert, ScrollView, TextInput, TouchableOpacity, useColorScheme, StyleSheet, Image, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router/build/hooks'
import HeaderSection from '@/components/features/header'

import { useDispatch, useSelector } from 'react-redux'
import { FullScreenLoader } from '@/hooks/use-screensLoder'

import { Colors } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'
import { classMarksSaveApiCall, getEntryMarksApiCall, setMarksEntryData, studentMarksSaveApiCall } from '@/redux/slices/markSlices'

interface Schedule {
  id: string;
  subject_id: string;
  subject: string;
  theory_max: number;
  practical_max: number;
  internal_max: number;
  total_max: number;
}

interface StudentMark {
  theory_marks: number | null;
  practical_marks: number | null;
  internal_marks: number | null;
  is_absent: boolean;
}

interface Student {
  id: string;
  full_name: string;
  student_id: string;
  roll_no: string;
  photo_url: string;
  subjects_entered: number;
  subjects_total: number;
  is_complete: boolean;
  marks: {
    [key: string]: StudentMark;
  };
}

interface SavePayload {
  class_id: string;
  section_id: string;
  marks: {
    [scheduleId: string]: {
      [studentId: string]: {
        theory_marks: number | null;
        practical_marks: number | null;
        internal_marks: number | null;
        is_absent: boolean;
      }
    }
  }
}

interface StudentSavePayload {
  marks: {
    [scheduleId: string]: {
      theory_marks: number | null;
      practical_marks: number | null;
      internal_marks: number | null;
      is_absent: boolean;
    }
  };
  remarks?: string;
}

const ClassMarksEntry = () => {
  const params = useLocalSearchParams()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savingStudent, setSavingStudent] = useState<string | null>(null)
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)
  const [editedMarks, setEditedMarks] = useState<{[key: string]: any}>({})
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const [remarks, setRemarks] = useState<{[key: string]: string}>({})
  const scheme = useColorScheme()
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme]

  const { marksEntryData } = useSelector((state: any) => state.marks)
  const examData = marksEntryData?.exam
  const classData = marksEntryData?.class
  const schedules: Schedule[] = marksEntryData?.schedules || []
  const students: Student[] = marksEntryData?.students || []

  // Get selected subject data
  const selectedSubject = schedules.find(s => s.id === selectedSubjectId)

  const fetchMarksEntryData = async (params: any) => {
    try {
      setLoading(true)
      const res = await getEntryMarksApiCall(params)
      if (res?.success === true) {
        dispatch(setMarksEntryData(res))
        // Set first subject as default
        if (res.schedules && res.schedules.length > 0) {
          setSelectedSubjectId(res.schedules[0].id)
        }
      } else {
        Alert.alert("Failed", res?.message)
      }
    } catch (error: any) {
      Alert.alert("Failed", error?.message || "server not responsed")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMarksEntryData(params)
  }, [])

  const toggleStudentExpand = (studentId: string) => {
    setExpandedStudent(expandedStudent === studentId ? null : studentId)
  }

  const handleMarkChange = (studentId: string, scheduleId: string, field: string, value: string) => {
    const key = `${studentId}_${scheduleId}`
    const numValue = value === '' ? null : Number(value)
    
    setEditedMarks(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: numValue
      }
    }))
  }

  const getStudentMark = (student: Student, scheduleId: string, field: keyof StudentMark) => {
    const editedKey = `${student.id}_${scheduleId}`
    if (editedMarks[editedKey] && editedMarks[editedKey][field] !== undefined) {
      return editedMarks[editedKey][field]
    }
    return student.marks[scheduleId]?.[field] ?? ''
  }

  const getCurrentMark = (student: Student, scheduleId: string, field: keyof StudentMark): any | any => {
    const editedKey = `${student.id}_${scheduleId}`
    if (editedMarks[editedKey] && editedMarks[editedKey][field] !== undefined) {
      return editedMarks[editedKey][field]
    }
    return student.marks[scheduleId]?.[field] ?? null
  }

  const prepareStudentPayload = (studentId: string): StudentSavePayload => {
    const marks: StudentSavePayload['marks'] = {}
    
    // Only include the selected subject if one is selected
    const subjectsToSave = selectedSubjectId 
      ? schedules.filter(s => s.id === selectedSubjectId)
      : schedules
    
    subjectsToSave.forEach(schedule => {
      const student = students.find(s => s.id === studentId)!
      const theoryMarks = getCurrentMark(student, schedule.id, 'theory_marks')
      const practicalMarks = getCurrentMark(student, schedule.id, 'practical_marks')
      const internalMarks = getCurrentMark(student, schedule.id, 'internal_marks')
      const isAbsent = student.marks[schedule.id]?.is_absent || false

      marks[schedule.id] = {
        theory_marks: theoryMarks,
        practical_marks: practicalMarks,
        internal_marks: internalMarks,
        is_absent: isAbsent
      }
    })
    
    return {
      marks: marks,
      remarks: remarks[studentId] || ''
    }
  }

  const handleStudentMarksSaveBtn = async (studentId: string) => {
    try {
      const payload = prepareStudentPayload(studentId)
      
      // Check if there are any marks to save for the selected subject
      let hasMarks = false
      const subjectsToCheck = selectedSubjectId 
        ? [selectedSubjectId] 
        : Object.keys(payload.marks)
      
      for (const scheduleId of subjectsToCheck) {
        const mark = payload.marks[scheduleId]
        if (mark && (mark.theory_marks !== null || mark.practical_marks !== null || mark.internal_marks !== null)) {
          hasMarks = true
          break
        }
      }
      
      if (!hasMarks) {
        Alert.alert("Info", `No marks to save for ${selectedSubject?.subject || 'selected subject'}.`)
        return
      }

      const examId = params?.id || marksEntryData?.exam?.id
      setSavingStudent(studentId)
      
      const res = await studentMarksSaveApiCall(payload, examId, studentId)
      
      if (res?.success === true) {
        Alert.alert("Success", res?.message || "Marks saved successfully!")
        // Clear edited marks for this student for the selected subject
        const keysToRemove = Object.keys(editedMarks).filter(key => {
          const [studentKey, scheduleKey] = key.split('_')
          return studentKey === studentId && (selectedSubjectId ? scheduleKey === selectedSubjectId : true)
        })
        const newEditedMarks = {...editedMarks}
        keysToRemove.forEach(key => delete newEditedMarks[key])
        setEditedMarks(newEditedMarks)
        // Clear remarks for this student
        const newRemarks = {...remarks}
        delete newRemarks[studentId]
        setRemarks(newRemarks)
        // Refresh data
        fetchMarksEntryData(params)
      } else {
        Alert.alert("Failed", res?.message || "Failed to save marks")
      }
    } catch (error: any) {
      Alert.alert("Failed", error?.message || "Server not responding")
    } finally {
      setSavingStudent(null)
    }
  }

  const handleClassMarksSaveBtn = async () => {
    try {
      const payload = preparePayload()
      
      let hasMarks = false
      for (const scheduleId in payload.marks) {
        if (Object.keys(payload.marks[scheduleId]).length > 0) {
          hasMarks = true
          break
        }
      }
      
      if (!hasMarks) {
        Alert.alert("Info", "No marks to save. Please enter marks for at least one subject.")
        return
      }

      const examId = params?.id || marksEntryData?.exam?.id
      setSaving(true)
      const res = await classMarksSaveApiCall(payload, examId)
      
      if (res?.success === true) {
        Alert.alert("Success", res?.message)
        fetchMarksEntryData(params)
        setEditedMarks({})
        setRemarks({})
      } else {
        Alert.alert("Failed", res?.message || "Failed to save marks")
      }
    } catch (error: any) {
      Alert.alert("Failed", error?.message || "Server not responding")
    } finally {
      setSaving(false)
    }
  }

  const preparePayload = (): SavePayload => {
    const marks: SavePayload['marks'] = {}
    
    const classId = classData?.id || ''
    const sectionId = classData?.section_id || ''
    
    // If a subject is selected, only save that subject
    const subjectsToSave = selectedSubjectId 
      ? schedules.filter(s => s.id === selectedSubjectId)
      : schedules
    
    subjectsToSave.forEach(schedule => {
      marks[schedule.id] = {}
      
      students.forEach(student => {
        const theoryMarks = getCurrentMark(student, schedule.id, 'theory_marks')
        const practicalMarks = getCurrentMark(student, schedule.id, 'practical_marks')
        const internalMarks = getCurrentMark(student, schedule.id, 'internal_marks')
        const isAbsent = student.marks[schedule.id]?.is_absent || false

        if (theoryMarks !== null || practicalMarks !== null || internalMarks !== null) {
          marks[schedule.id][student.id] = {
            theory_marks: theoryMarks,
            practical_marks: practicalMarks,
            internal_marks: internalMarks,
            is_absent: isAbsent
          }
        }
      })
    })
    
    return {
      class_id: classId,
      section_id: sectionId,
      marks: marks
    }
  }

  const calculateTotal = (student: Student, scheduleId: string) => {
    const theory = getCurrentMark(student, scheduleId, 'theory_marks')
    const practical = getCurrentMark(student, scheduleId, 'practical_marks')
    const internal = getCurrentMark(student, scheduleId, 'internal_marks')
    
    if (theory !== null && practical !== null && internal !== null) {
      return theory + practical + internal
    }
    return null
  }

  const getStatusColor = (isComplete: boolean) => {
    return isComplete ? '#4CAF50' : '#FF9800'
  }

  const getStatusText = (isComplete: boolean) => {
    return isComplete ? 'Complete' : 'Pending'
  }

  const isStudentComplete = (student: Student) => {
    let completed = 0
    schedules.forEach(schedule => {
      const theory = getCurrentMark(student, schedule.id, 'theory_marks')
      const practical = getCurrentMark(student, schedule.id, 'practical_marks')
      const internal = getCurrentMark(student, schedule.id, 'internal_marks')
      
      if (theory !== null && practical !== null && internal !== null) {
        completed++
      }
    })
    return completed === schedules.length
  }

  // Render student item for FlatList - shows only selected subject
  const renderStudentItem = ({ item: student }: { item: Student }) => {
    const isComplete = isStudentComplete(student)
    const isSaving = savingStudent === student.id
    
    return (
      <View style={[styles.studentCard, { backgroundColor: colors.card }]}>
        <TouchableOpacity 
          style={styles.studentHeader}
          onPress={() => toggleStudentExpand(student.id)}
          activeOpacity={0.7}
        >
          <View style={styles.studentInfo}>
            {student.photo_url ? (
              <Image source={{ uri: student.photo_url }} style={styles.studentPhoto} />
            ) : (
              <View style={[styles.studentPhotoPlaceholder, { backgroundColor: colors.primary }]}>
                <Text style={styles.studentPhotoText}>
                  {student.full_name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.studentDetails}>
              <Text style={[styles.studentName, { color: colors.text }]}>
                {student.full_name}
              </Text>
              <Text style={[styles.studentRollNo, { color: colors.textSecondary }]}>
                Roll No: {student.roll_no} | ID: {student.student_id}
              </Text>
            </View>
          </View>
          <View style={styles.studentStatus}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(isComplete) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(isComplete) }]}>
                {getStatusText(isComplete)}
              </Text>
            </View>
            <Ionicons 
              name={expandedStudent === student.id ? 'chevron-up' : 'chevron-down'} 
              size={24} 
              color={colors.textSecondary} 
            />
          </View>
        </TouchableOpacity>

        {expandedStudent === student.id && (
          <View style={styles.marksContainer}>
            {/* Show only the selected subject */}
            {selectedSubject ? (
              <View style={[styles.subjectMarksCard, { borderColor: colors.border || '#E0E0E0' }]}>
                <Text style={[styles.subjectMarksTitle, { color: colors.text }]}>
                  {selectedSubject.subject}
                </Text>
                <View style={styles.marksRow}>
                  <View style={styles.markInputGroup}>
                    <Text style={[styles.markLabel, { color: colors.textSecondary }]}>Theory</Text>
                    <TextInput
                      style={[styles.markInput, { 
                        color: colors.text,
                        borderColor: colors.border || '#E0E0E0',
                        backgroundColor: colors.background
                      }]}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={colors.textSecondary}
                      value={String(getStudentMark(student, selectedSubject.id, 'theory_marks') ?? '')}
                      onChangeText={(value) => handleMarkChange(student.id, selectedSubject.id, 'theory_marks', value)}
                    />
                    <Text style={[styles.maxText, { color: colors.textSecondary }]}>/{selectedSubject.theory_max}</Text>
                  </View>
                  <View style={styles.markInputGroup}>
                    <Text style={[styles.markLabel, { color: colors.textSecondary }]}>Practical</Text>
                    <TextInput
                      style={[styles.markInput, { 
                        color: colors.text,
                        borderColor: colors.border || '#E0E0E0',
                        backgroundColor: colors.background
                      }]}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={colors.textSecondary}
                      value={String(getStudentMark(student, selectedSubject.id, 'practical_marks') ?? '')}
                      onChangeText={(value) => handleMarkChange(student.id, selectedSubject.id, 'practical_marks', value)}
                    />
                    <Text style={[styles.maxText, { color: colors.textSecondary }]}>/{selectedSubject.practical_max}</Text>
                  </View>
                  <View style={styles.markInputGroup}>
                    <Text style={[styles.markLabel, { color: colors.textSecondary }]}>Internal</Text>
                    <TextInput
                      style={[styles.markInput, { 
                        color: colors.text,
                        borderColor: colors.border || '#E0E0E0',
                        backgroundColor: colors.background
                      }]}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={colors.textSecondary}
                      value={String(getStudentMark(student, selectedSubject.id, 'internal_marks') ?? '')}
                      onChangeText={(value) => handleMarkChange(student.id, selectedSubject.id, 'internal_marks', value)}
                    />
                    <Text style={[styles.maxText, { color: colors.textSecondary }]}>/{selectedSubject.internal_max}</Text>
                  </View>
                </View>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total:</Text>
                  <Text style={[styles.totalValue, { 
                    color: calculateTotal(student, selectedSubject.id) !== null ? colors.primary : colors.textSecondary,
                    fontWeight: calculateTotal(student, selectedSubject.id) !== null ? 'bold' : 'normal'
                  }]}>
                    {calculateTotal(student, selectedSubject.id) !== null ? calculateTotal(student, selectedSubject.id) : 'Not entered'}
                  </Text>
                </View>
                {student.marks[selectedSubject.id]?.is_absent && (
                  <View style={styles.absentBadge}>
                    <Text style={styles.absentText}>ABSENT</Text>
                  </View>
                )}
              </View>
            ) : (
              // Show all subjects when "All" is selected
              schedules.map((schedule) => {
                const total = calculateTotal(student, schedule.id)
                const marks = student.marks[schedule.id]
                
                return (
                  <View key={schedule.id} style={[styles.subjectMarksCard, { borderColor: colors.border || '#E0E0E0' }]}>
                    <Text style={[styles.subjectMarksTitle, { color: colors.text }]}>
                      {schedule.subject}
                    </Text>
                    <View style={styles.marksRow}>
                      <View style={styles.markInputGroup}>
                        <Text style={[styles.markLabel, { color: colors.textSecondary }]}>Theory</Text>
                        <TextInput
                          style={[styles.markInput, { 
                            color: colors.text,
                            borderColor: colors.border || '#E0E0E0',
                            backgroundColor: colors.background
                          }]}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor={colors.textSecondary}
                          value={String(getStudentMark(student, schedule.id, 'theory_marks') ?? '')}
                          onChangeText={(value) => handleMarkChange(student.id, schedule.id, 'theory_marks', value)}
                        />
                        <Text style={[styles.maxText, { color: colors.textSecondary }]}>/{schedule.theory_max}</Text>
                      </View>
                      <View style={styles.markInputGroup}>
                        <Text style={[styles.markLabel, { color: colors.textSecondary }]}>Practical</Text>
                        <TextInput
                          style={[styles.markInput, { 
                            color: colors.text,
                            borderColor: colors.border || '#E0E0E0',
                            backgroundColor: colors.background
                          }]}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor={colors.textSecondary}
                          value={String(getStudentMark(student, schedule.id, 'practical_marks') ?? '')}
                          onChangeText={(value) => handleMarkChange(student.id, schedule.id, 'practical_marks', value)}
                        />
                        <Text style={[styles.maxText, { color: colors.textSecondary }]}>/{schedule.practical_max}</Text>
                      </View>
                      <View style={styles.markInputGroup}>
                        <Text style={[styles.markLabel, { color: colors.textSecondary }]}>Internal</Text>
                        <TextInput
                          style={[styles.markInput, { 
                            color: colors.text,
                            borderColor: colors.border || '#E0E0E0',
                            backgroundColor: colors.background
                          }]}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor={colors.textSecondary}
                          value={String(getStudentMark(student, schedule.id, 'internal_marks') ?? '')}
                          onChangeText={(value) => handleMarkChange(student.id, schedule.id, 'internal_marks', value)}
                        />
                        <Text style={[styles.maxText, { color: colors.textSecondary }]}>/{schedule.internal_max}</Text>
                      </View>
                    </View>
                    <View style={styles.totalRow}>
                      <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total:</Text>
                      <Text style={[styles.totalValue, { 
                        color: total !== null ? colors.primary : colors.textSecondary,
                        fontWeight: total !== null ? 'bold' : 'normal'
                      }]}>
                        {total !== null ? total : 'Not entered'}
                      </Text>
                    </View>
                    {marks?.is_absent && (
                      <View style={styles.absentBadge}>
                        <Text style={styles.absentText}>ABSENT</Text>
                      </View>
                    )}
                  </View>
                )
              })
            )}
            
            {/* Remarks Input */}
            <View style={styles.remarksContainer}>
              <Text style={[styles.remarksLabel, { color: colors.textSecondary }]}>Remarks (Optional)</Text>
              <TextInput
                style={[styles.remarksInput, { 
                  color: colors.text,
                  borderColor: colors.border || '#E0E0E0',
                  backgroundColor: colors.background
                }]}
                placeholder="Enter remarks..."
                placeholderTextColor={colors.textSecondary}
                value={remarks[student.id] || ''}
                onChangeText={(value) => setRemarks(prev => ({...prev, [student.id]: value}))}
                multiline
                numberOfLines={2}
              />
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: colors.primary, opacity: isSaving ? 0.7 : 1 }]}
              onPress={() => handleStudentMarksSaveBtn(student.id)}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : `Save ${selectedSubject ? selectedSubject.subject : 'All'} Marks`}
              </Text>
              <Ionicons name="save-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    )
  }

  // Render header component for FlatList
  const renderHeader = () => (
    <>
      {/* Exam & Class Info */}
      <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Exam:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{examData?.name || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Type:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{examData?.type_label || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Class:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{classData?.name || 'N/A'} - {classData?.section || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Students:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{students.length}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Subjects:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{schedules.length}</Text>
        </View>
      </View>

      {/* Subject Tabs */}
      <View style={[styles.subjectsHeader, { backgroundColor: colors.card }]}>
        <Text style={[styles.subjectsTitle, { color: colors.text }]}>Filter by Subject</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.subjectTab,
              !selectedSubjectId && styles.subjectTabActive,
              { 
                backgroundColor: !selectedSubjectId ? colors.primary : 'transparent',
                borderColor: colors.border || '#E0E0E0'
              }
            ]}
            onPress={() => setSelectedSubjectId(null)}
          >
            <Text style={[
              styles.subjectTabText,
              { color: !selectedSubjectId ? '#fff' : colors.text }
            ]}>
              All Subjects
            </Text>
          </TouchableOpacity>
          {schedules.map((schedule) => (
            <TouchableOpacity
              key={schedule.id}
              style={[
                styles.subjectTab,
                selectedSubjectId === schedule.id && styles.subjectTabActive,
                { 
                  backgroundColor: selectedSubjectId === schedule.id ? colors.primary : 'transparent',
                  borderColor: colors.border || '#E0E0E0'
                }
              ]}
              onPress={() => setSelectedSubjectId(schedule.id)}
            >
              <Text style={[
                styles.subjectTabText,
                { color: selectedSubjectId === schedule.id ? '#fff' : colors.text }
              ]}>
                {schedule.subject}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Save All Button */}
      <TouchableOpacity 
        style={[styles.saveAllButton, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
        onPress={handleClassMarksSaveBtn}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? 'Saving All...' : `Save All ${selectedSubject ? selectedSubject.subject : 'Subjects'} Marks`}
        </Text>
        <Ionicons name="save-outline" size={20} color="#fff" />
      </TouchableOpacity>
    </>
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderSection title="Marks Entry" />
      
      <FlatList
        data={students}
        renderItem={renderStudentItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No students found
            </Text>
          </View>
        }
      />
      
      <FullScreenLoader loading={loading} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatListContent: {
    padding: 16,
    paddingBottom: 30,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  subjectsHeader: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  subjectsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subjectTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  subjectTabActive: {
    borderColor: 'transparent',
  },
  subjectTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  studentCard: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studentPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  studentPhotoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentPhotoText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
  },
  studentRollNo: {
    fontSize: 12,
  },
  studentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  marksContainer: {
    padding: 12,
    paddingTop: 0,
  },
  subjectMarksCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  subjectMarksTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  marksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  markInputGroup: {
    flex: 1,
    alignItems: 'center',
  },
  markLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  markInput: {
    width: '100%',
    height: 36,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  maxText: {
    fontSize: 11,
    marginTop: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  totalValue: {
    fontSize: 16,
  },
  absentBadge: {
    backgroundColor: '#f44336',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  absentText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  remarksContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  remarksLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  remarksInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
})

export default ClassMarksEntry