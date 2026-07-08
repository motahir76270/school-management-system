import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image, TextInput, ScrollView } from 'react-native'
import React, { useEffect, useState, useMemo } from 'react'
import { Picker } from '@react-native-picker/picker'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import HeaderSection from '@/components/features/header'
import { 
  getStudentAttendanceList, 
  getStudentSectionTypes, 
  updateStudentAttendance 
} from '@/hooks/apiCalls/teacher'
import { FullScreenLoader } from '@/hooks/use-screensLoder'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// Zod validation schema
const attendanceFormSchema = z.object({
  classId: z.string({
    error: "Please select a class",
  }).min(1, "Class is required"),
  sectionId: z.string({
    error: "Please select a section",
  }).min(1, "Section is required"),
})

type AttendanceFormData = z.infer<typeof attendanceFormSchema>

// Status options
const STATUS_OPTIONS = [
  { label: 'Select Status', value: '' },
  { label: 'Present', value: 'present' },
  { label: 'Absent', value: 'absent' },
  { label: 'Half Day', value: 'halfday' },
  { label: 'Late', value: 'late' },
]

interface Student {
  id: string
  full_name: string
  student_id: string
  roll_no: string
  photo_url: string
  attendance: string | null
}

const manual = () => {
  const [classesData, setClassesData] = useState([])
  const [loading, setLoading] = useState(false)
  const [attendanceData, setAttendanceData] = useState<Student[]>([])
  const [classOptions, setClassOptions] = useState([])
  const [sectionOptions, setSectionOptions] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const safeInset = useSafeAreaInsets()
  
  // Track which students have been explicitly selected by the user
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())

  // React Hook Form
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      classId: '',
      sectionId: '',
    }
  })

  // Watch classId to update sections
  const selectedClassId = watch('classId')

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) {
      return attendanceData
    }
    
    const query = searchQuery.toLowerCase().trim()
    return attendanceData.filter(student => {
      const name = student.full_name?.toLowerCase() || ''
      const rollNo = student.roll_no?.toLowerCase() || ''
      const studentId = student.student_id?.toLowerCase() || ''
      
      return name.includes(query) || 
             rollNo.includes(query) || 
             studentId.includes(query)
    })
  }, [attendanceData, searchQuery])

  const fetchStudentSectionTypes = async() => {
    try {
      setLoading(true)
      const res = await getStudentSectionTypes();
   
      if (res.success === true) {
        const classes = res.classes.map((item:any) => ({
          label: item.name,
          value: item.id
        }))
        setClassOptions(classes)
        setClassesData(res.classes)
      }
    } catch (error) {
      console.error("Error fetching section types:", error)
      Alert.alert('Error', 'Failed to fetch section types')
    } finally {
      setLoading(false)
    }
  }

  // Handle form submission to load students
  const onSubmit = async (data: AttendanceFormData) => {
    try {
      setIsSubmitting(true)
      const currentDate = new Date().toISOString().split('T')[0]
      setSelectedDate(currentDate)
      
      const payload = {
        class_id: data.classId,
        section_id: data.sectionId,
        date: currentDate
      }
      const res = await getStudentAttendanceList(payload);   
      if (res && res.success && res.students) {
        const processedStudents = res.students.map((student: any) => {
          let attendanceStatus = null
          if (student.attendance && typeof student.attendance === 'object') {
            attendanceStatus = student.attendance.status || null
          } else if (typeof student.attendance === 'string') {
            attendanceStatus = student.attendance
          }
          
          return {
            ...student,
            attendance: attendanceStatus
          }
        })
        setAttendanceData(processedStudents)
        setSelectedStudents(new Set())
        setSearchQuery('')
        
        if (processedStudents.length === 0) {
          Alert.alert('Info', 'No students found for this class and section')
        }
      }
    } catch (error) {
      console.error("Error fetching attendance:", error)
      Alert.alert('Error', 'Failed to fetch attendance data')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle status change for a student (local update only)
  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceData(prevData =>
      prevData.map(student =>
        student.id === studentId
          ? { ...student, attendance: status || null }
          : student
      )
    )
    
    if (status && status !== '') {
      setSelectedStudents(prev => new Set(prev).add(studentId))
    } else {
      setSelectedStudents(prev => {
        const newSet = new Set(prev)
        newSet.delete(studentId)
        return newSet
      })
    }
  }

  // Submit all attendance data at once
  const handleSubmitAttendance = async () => {
    try {
      setIsSaving(true)
      
      const date = selectedDate || new Date().toISOString().split('T')[0]
      
      const attendancePayload = attendanceData
        .filter(student => {
          return selectedStudents.has(student.id) && 
                 student.attendance !== null && 
                 student.attendance !== undefined && 
                 student.attendance !== ''
        })
        .map(student => ({
          student_id: student.id,
          status: student.attendance
        }))

      if (attendancePayload.length === 0) {
        Alert.alert('Info', 'No attendance selected. Please select status for at least one student.')
        setIsSaving(false)
        return
      }

      const payload = {
        date: date,
        attendance: attendancePayload
      }
      
      const res = await updateStudentAttendance(payload)
      
      if (res && res.success) {
        Alert.alert('Success', `Attendance saved successfully for ${attendancePayload.length} students`)
        setSelectedStudents(new Set())
      } else {
        Alert.alert('Error', res?.message || 'Failed to save attendance')
      }
    } catch (error) {
      console.error("Error saving attendance:", error)
      Alert.alert('Error', 'Failed to save attendance')
    } finally {
      setIsSaving(false)
    }
  }

  // Update sections when class is selected
  useEffect(() => {
    if (selectedClassId && classesData.length > 0) {
      const selectedClass:any = classesData.find((item:any) => item.id === selectedClassId)
      if (selectedClass) {
        const sections = selectedClass.sections || []
        const options = sections.map((section:any) => ({
          label: section.name,
          value: section.id
        }))
        setSectionOptions(options)
        setValue('sectionId', '')
        setAttendanceData([])
        setSelectedStudents(new Set())
        setSearchQuery('')
      }
    }
  }, [selectedClassId, classesData, setValue])

  useEffect(() => {
    fetchStudentSectionTypes();
  }, [])

  // Reset form
  const handleReset = () => {
    reset({
      classId: '',
      sectionId: '',
    })
    setAttendanceData([])
    setSectionOptions([])
    setSelectedDate('')
    setSelectedStudents(new Set())
    setSearchQuery('')
  }

  // Clear search
  const clearSearch = () => {
    setSearchQuery('')
  }

  // Render each student item
  const renderStudentItem = ({ item }: { item: Student }) => {
    const currentStatus = item.attendance || ''
    const isSelected = selectedStudents.has(item.id)

    // Get status color
    const getStatusColor = (status: string) => {
      switch(status) {
        case 'present': return '#34C759';
        case 'absent': return '#FF3B30';
        case 'halfday': return '#FF9500';
        case 'late': return '#FF6B35';
        default: return '#8E8E93';
      }
    }

    return (
      <View style={[
        styles.studentCard,
        isSelected && styles.selectedStudentCard
      ]}>
        <View style={styles.studentInfo}>
          <View style={styles.studentAvatar}>
            {item.photo_url ? (
              <Image
                source={{ uri: item.photo_url }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {item.full_name?.charAt(0) || 'S'}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.studentDetails}>
            <Text style={styles.studentName} numberOfLines={1}>
              {item.full_name || 'Student'}
            </Text>
            <Text style={styles.studentMeta} numberOfLines={1}>
              Roll: {item.roll_no || 'N/A'} | ID: {item.student_id || 'N/A'}
            </Text>
            {isSelected && currentStatus && (
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentStatus) }]}>
                <Text style={styles.statusBadgeText}>
                  {currentStatus.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View style={styles.pickerWrapperSmall}>
            <Picker
              selectedValue={currentStatus}
              onValueChange={(value) => {
                handleStatusChange(item.id, value)
              }}
              style={styles.statusPicker}
              dropdownIconColor="#007AFF"
              mode="dropdown"
            >
              {STATUS_OPTIONS.map((option) => (
                <Picker.Item 
                  key={option.value} 
                  label={option.label} 
                  value={option.value} 
                />
              ))}
            </Picker>
          </View>
        </View>
      </View>
    )
  }

  // Get selected count
  const selectedCount = selectedStudents.size

  return (
    <View style={styles.container}>
      <HeaderSection title="Manual" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.dropdownContainer}>
          {/* Class and Section Pickers */}
          <View style={styles.pickerRow}>
            <View style={[styles.pickerWrapper, styles.pickerWrapperHalf]}>
              <Text style={styles.label}>Class <Text style={styles.requiredStar}>*</Text></Text>
              <View style={[
                styles.pickerContainer,
                errors.classId && styles.pickerError
              ]}>
                <Controller
                  control={control}
                  name="classId"
                  render={({ field: { onChange, value } }) => (
                    <Picker
                      selectedValue={value}
                      onValueChange={onChange}
                      enabled={!loading}
                      style={styles.picker}
                      dropdownIconColor="#007AFF"
                    >
                      <Picker.Item label="Select Class" value="" />
                      {classOptions.map((item:any) => (
                        <Picker.Item key={item.value} label={item.label} value={item.value} />
                      ))}
                    </Picker>
                  )}
                />
              </View>
              {errors.classId && (
                <Text style={styles.errorText}>{errors.classId.message}</Text>
              )}
            </View>

            <View style={[styles.pickerWrapper, styles.pickerWrapperHalf]}>
              <Text style={styles.label}>Section <Text style={styles.requiredStar}>*</Text></Text>
              <View style={[
                styles.pickerContainer,
                errors.sectionId && styles.pickerError
              ]}>
                <Controller
                  control={control}
                  name="sectionId"
                  render={({ field: { onChange, value } }) => (
                    <Picker
                      selectedValue={value}
                      onValueChange={onChange}
                      enabled={!!selectedClassId && !loading}
                      style={styles.picker}
                      dropdownIconColor="#007AFF"
                    >
                      <Picker.Item label="Select Section" value="" />
                      {sectionOptions.length > 0 ? (
                        sectionOptions.map((item:any) => (
                          <Picker.Item key={item.value} label={item.label} value={item.value} />
                        ))
                      ) : (
                        <Picker.Item label="No sections" value="" />
                      )}
                    </Picker>
                  )}
                />
              </View>
              {errors.sectionId && (
                <Text style={styles.errorText}>{errors.sectionId.message}</Text>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[
                styles.loadButton,
                (isSubmitting || loading) && styles.disabledButton
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting || loading}
            >
              <Text style={styles.loadButtonText}>
                {isSubmitting ? 'Loading...' : '📋 Load Students'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.resetButton}
              onPress={handleReset}
              disabled={isSubmitting || loading}
            >
              <Text style={styles.resetButtonText}>↺ Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        {attendanceData.length > 0 && (
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search students..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
            
        
          </View>
        )}

        {/* Students List */}
        {isSubmitting || loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading students...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredStudents}
            keyExtractor={(item) => item.id}
            renderItem={renderStudentItem}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📭</Text>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No matching students' : 'No students found'}
                </Text>
                <Text style={styles.emptySubText}>
                  {searchQuery 
                    ? 'Try adjusting your search' 
                    : 'Select class & section and tap "Load Students"'}
                </Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            scrollEnabled={false}
          />
        )}

        {/* Extra bottom padding for the submit button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button - Fixed at bottom */}
      {attendanceData.length > 0 && (
        <View style={[styles.footerContainer, { paddingBottom: safeInset.bottom || 16 }]}>
          <TouchableOpacity 
            style={[styles.submitButton, (isSaving || selectedCount === 0) && styles.disabledButton]}
            onPress={handleSubmitAttendance}
            disabled={isSaving || selectedCount === 0}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.submitButtonText}>
                💾 Save Attendance {selectedCount > 0 ? `(${selectedCount})` : ''}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <FullScreenLoader loading={loading || isSubmitting || isSaving} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  dropdownContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  pickerWrapper: {
    marginBottom: 8,
  },
  pickerWrapperHalf: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  requiredStar: {
    color: '#FF3B30',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
    overflow: 'hidden',
    height: 50,
  },
  pickerError: {
    borderColor: '#FF3B30',
    borderWidth: 2,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  loadButton: {
    flex: 2,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  loadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  searchSection: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#666',
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 15,
    color: '#333',
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingVertical: 4,
  },
  countText: {
    fontSize: 13,
    color: '#666',
  },
  countNumber: {
    fontWeight: '700',
    color: '#007AFF',
    fontSize: 14,
  },
  selectedText: {
    fontSize: 13,
    color: '#666',
  },
  selectedCount: {
    fontWeight: '700',
    color: '#34C759',
    fontSize: 14,
  },
  dateText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  studentCard: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 70,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedStudentCard: {
    borderColor: '#34C759',
    borderWidth: 2,
    backgroundColor: '#f0fff4',
  },
  studentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    minWidth: 0,
  },
  studentAvatar: {
    marginRight: 12,
    flexShrink: 0,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  studentDetails: {
    flex: 1,
    minWidth: 0,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  studentMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 3,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  statusContainer: {
    flexShrink: 0,
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerWrapperSmall: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    backgroundColor: 'white',
    overflow: 'hidden',
    width: '100%',
    height: 40,
    justifyContent: 'center',
  },
  statusPicker: {
    height: 70,
    width: '100%',
  },
  loaderContainer: {
    paddingVertical: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    paddingVertical: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 5,
  },
  submitButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
})

export default manual