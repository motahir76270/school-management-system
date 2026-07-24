import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, Modal } from 'react-native'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Feather } from '@expo/vector-icons'
import { useDispatch } from 'react-redux'
import { createOnlineExamApiCall } from '@/redux/examSlice/teacherExamSlice'
import { Picker } from '@react-native-picker/picker'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { showError } from '@/components/service/AlertService'
import DateTimePicker from '@react-native-community/datetimepicker'

// Helper function to format date
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Helper function to validate date format
const isValidDate = (dateString: string) => {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

// Helper to format date for display in input
const formatDateForInput = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// Zod validation schema
const examSchema = z.object({
  title: z.string().min(1, 'Exam title is required'),
  subject_id: z.string().min(1, 'Please select a subject'),
  school_class_id: z.string().min(1, 'Please select a class'),
  section_id: z.string().min(1, 'Please select a section'),
  duration_minutes: z.string()
    .min(1, 'Duration is required')
    .regex(/^\d+$/, 'Duration must be a number'),
  starts_at: z.string()
    .min(1, 'Start date and time is required')
    .refine((val) => isValidDate(val), 'Invalid date format. Use YYYY-MM-DD HH:mm'),
  ends_at: z.string()
    .min(1, 'End date and time is required')
    .refine((val) => isValidDate(val), 'Invalid date format. Use YYYY-MM-DD HH:mm'),
  total_questions: z.string().optional()
    .refine((val) => !val || /^\d+$/.test(val), 'Must be a number'),
  total_marks: z.string().optional()
    .refine((val) => !val || /^\d+$/.test(val), 'Must be a number'),
  negative_marking: z.boolean().default(false),
  negative_marks: z.string().optional()
    .refine((val) => !val || /^\d*\.?\d+$/.test(val), 'Must be a valid number'),
  shuffle_questions: z.boolean().default(false),
  shuffle_options: z.boolean().default(false),
  fullscreen_required: z.boolean().default(false),
  auto_submit: z.boolean().default(true),
  instructions: z.string().optional(),
}).refine((data) => {
  if (data.negative_marking && !data.negative_marks) {
    return false
  }
  return true
}, {
  message: "Negative marks are required when negative marking is enabled",
  path: ["negative_marks"]
}).refine((data) => {
  if (data.starts_at && data.ends_at) {
    const start = new Date(data.starts_at)
    const end = new Date(data.ends_at)
    return end > start
  }
  return true
}, {
  message: "End date must be after start date",
  path: ["ends_at"]
})

type ExamFormData = z.infer<typeof examSchema>

interface AddExamFormProps {
  classSectionTypes: any
  onExamCreated: (examId: string) => void
  examId?: string
  isEditing?: boolean
  initialData?: ExamFormData
}

const AddExamForm = ({ 
  classSectionTypes, 
  onExamCreated, 
  examId, 
  isEditing = false,
  initialData 
}: any) => {
  const dispatch = useDispatch()
  
  // State for date pickers
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date')
  const [tempStartDate, setTempStartDate] = useState<Date>(new Date())
  const [tempEndDate, setTempEndDate] = useState<Date>(new Date())

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: '',
      subject_id: '',
      school_class_id: '',
      section_id: '',
      duration_minutes: '',
      starts_at: '',
      ends_at: '',
      total_questions: '',
      total_marks: '',
      negative_marking: false,
      negative_marks: '',
      shuffle_questions: false,
      shuffle_options: false,
      fullscreen_required: false,
      auto_submit: true,
      instructions: '',
    }
  })

  const selectedClassId = watch('school_class_id')
  const negativeMarking = watch('negative_marking')
  const startsAt = watch('starts_at')
  const endsAt = watch('ends_at')
  
  // Memoize selected class
  const selectedClass = useMemo(() => {
    return classSectionTypes?.classes?.find(
      (cls: any) => cls.id === selectedClassId
    )
  }, [classSectionTypes?.classes, selectedClassId])

  // Memoize formatted dates
  const formattedStartDate = useMemo(() => {
    return startsAt ? formatDate(startsAt) : ''
  }, [startsAt])

  const formattedEndDate = useMemo(() => {
    return endsAt ? formatDate(endsAt) : ''
  }, [endsAt])

  useEffect(() => {
    if (initialData) {
      reset(initialData)
      // Set temp dates if initial data exists
      if (initialData.starts_at) {
        setTempStartDate(new Date(initialData.starts_at))
      }
      if (initialData.ends_at) {
        setTempEndDate(new Date(initialData.ends_at))
      }
    }
  }, [initialData, reset])

  // Handle date picker change
  const onStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartPicker(false)
      if (selectedDate) {
        const currentDate = new Date(tempStartDate)
        if (pickerMode === 'date') {
          // Update date part
          currentDate.setFullYear(selectedDate.getFullYear())
          currentDate.setMonth(selectedDate.getMonth())
          currentDate.setDate(selectedDate.getDate())
          setTempStartDate(currentDate)
          // Switch to time picker
          setPickerMode('time')
          setShowStartPicker(true)
        } else {
          // Update time part
          currentDate.setHours(selectedDate.getHours())
          currentDate.setMinutes(selectedDate.getMinutes())
          setTempStartDate(currentDate)
          // Update form value
          setValue('starts_at', formatDateForInput(currentDate))
        }
      }
    } else {
      // iOS: handle both date and time in one picker
      if (selectedDate) {
        setTempStartDate(selectedDate)
        setValue('starts_at', formatDateForInput(selectedDate))
        setShowStartPicker(false)
      }
    }
  }

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndPicker(false)
      if (selectedDate) {
        const currentDate = new Date(tempEndDate)
        if (pickerMode === 'date') {
          // Update date part
          currentDate.setFullYear(selectedDate.getFullYear())
          currentDate.setMonth(selectedDate.getMonth())
          currentDate.setDate(selectedDate.getDate())
          setTempEndDate(currentDate)
          // Switch to time picker
          setPickerMode('time')
          setShowEndPicker(true)
        } else {
          // Update time part
          currentDate.setHours(selectedDate.getHours())
          currentDate.setMinutes(selectedDate.getMinutes())
          setTempEndDate(currentDate)
          // Update form value
          setValue('ends_at', formatDateForInput(currentDate))
        }
      }
    } else {
      // iOS: handle both date and time in one picker
      if (selectedDate) {
        setTempEndDate(selectedDate)
        setValue('ends_at', formatDateForInput(selectedDate))
        setShowEndPicker(false)
      }
    }
  }

  // Open date picker
  const openStartDatePicker = () => {
    if (isEditing) return
    setPickerMode('date')
    setShowStartPicker(true)
  }

  const openEndDatePicker = () => {
    if (isEditing) return
    setPickerMode('date')
    setShowEndPicker(true)
  }

  // Handle picker cancel for Android
  const onStartPickerCancel = () => {
    setShowStartPicker(false)
  }

  const onEndPickerCancel = () => {
    setShowEndPicker(false)
  }

  const onSubmit = useCallback(async (data: ExamFormData) => {
    if (isEditing) {
      Alert.alert('Info', 'This exam is in view-only mode. No changes can be saved.')
      return
    }

    try {
      const result = await createOnlineExamApiCall(dispatch, data)
      if (result?.success === true) {
        onExamCreated(result.exam.id)
      }
    } catch (error) {
      showError('Failed to create exam. Please try again.')
    }
  }, [dispatch, onExamCreated, isEditing])

  return (
    <View style={[styles.container, isEditing && styles.containerDisabled]}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Exam Details</Text>
        {isEditing && (
          <View style={styles.viewOnlyBadge}>
            <Feather name="eye" size={14} color="#666" />
            <Text style={styles.viewOnlyText}>View Only</Text>
          </View>
        )}
      </View>
      
      {/* Exam Title */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Exam Title <Text style={styles.required}>*</Text></Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.title && styles.inputError, isEditing && styles.inputDisabled]}
              placeholder="Enter exam title"
              value={value}
              onChangeText={onChange}
              editable={!isEditing}
            />
          )}
        />
        {errors.title && (
          <Text style={styles.errorText}>{errors.title.message}</Text>
        )}
      </View>

      {/* Subject */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Subject <Text style={styles.required}>*</Text></Text>
        <Controller
          control={control}
          name="subject_id"
          render={({ field: { onChange, value } }) => (
            <View style={[styles.pickerContainer, errors.subject_id && styles.inputError, isEditing && styles.pickerDisabled]}>
              <Picker
                selectedValue={value || ''}
                onValueChange={onChange}
                style={styles.picker}
                enabled={!isEditing}
              >
                <Picker.Item label="Select Subject" value="" />
                {classSectionTypes?.subjects?.map((subject: any) => (
                  <Picker.Item key={subject.id} label={subject.name} value={subject.id} />
                ))}
              </Picker>
            </View>
          )}
        />
        {errors.subject_id && (
          <Text style={styles.errorText}>{errors.subject_id.message}</Text>
        )}
      </View>

      {/* Class and Section */}
      <View style={styles.row}>
        <View style={[styles.formGroup, styles.halfWidth]}>
          <Text style={styles.label}>Class <Text style={styles.required}>*</Text></Text>
          <Controller
            control={control}
            name="school_class_id"
            render={({ field: { onChange, value } }) => (
              <View style={[styles.pickerContainer, errors.school_class_id && styles.inputError, isEditing && styles.pickerDisabled]}>
                <Picker
                  selectedValue={value || ''}
                  onValueChange={(itemValue) => {
                    onChange(itemValue)
                    setValue('section_id', '')
                  }}
                  style={styles.picker}
                  enabled={!isEditing}
                >
                  <Picker.Item label="Select Class" value="" />
                  {classSectionTypes?.classes?.map((cls: any) => (
                    <Picker.Item key={cls.id} label={cls.name} value={cls.id} />
                  ))}
                </Picker>
              </View>
            )}
          />
          {errors.school_class_id && (
            <Text style={styles.errorText}>{errors.school_class_id.message}</Text>
          )}
        </View>

        <View style={[styles.formGroup, styles.halfWidth]}>
          <Text style={styles.label}>Section <Text style={styles.required}>*</Text></Text>
          <Controller
            control={control}
            name="section_id"
            render={({ field: { onChange, value } }) => (
              <View style={[styles.pickerContainer, errors.section_id && styles.inputError, isEditing && styles.pickerDisabled]}>
                <Picker
                  selectedValue={value || ''}
                  onValueChange={onChange}
                  style={styles.picker}
                  enabled={!isEditing && !!selectedClassId}
                >
                  <Picker.Item label="Select Section" value="" />
                  {selectedClass?.sections?.map((section: any) => (
                    <Picker.Item key={section.id} label={section.name} value={section.id} />
                  ))}
                </Picker>
              </View>
            )}
          />
          {errors.section_id && (
            <Text style={styles.errorText}>{errors.section_id.message}</Text>
          )}
        </View>
      </View>

      {/* Duration */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Duration (minutes) <Text style={styles.required}>*</Text></Text>
        <Controller
          control={control}
          name="duration_minutes"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.duration_minutes && styles.inputError, isEditing && styles.inputDisabled]}
              placeholder="Enter duration in minutes"
              keyboardType="numeric"
              value={value}
              onChangeText={onChange}
              editable={!isEditing}
            />
          )}
        />
        {errors.duration_minutes && (
          <Text style={styles.errorText}>{errors.duration_minutes.message}</Text>
        )}
      </View>

      {/* Start Date with Picker */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Start Date & Time <Text style={styles.required}>*</Text></Text>
        <Controller
          control={control}
          name="starts_at"
          render={({ field: { onChange, value } }) => (
            <>
              <TouchableOpacity
                style={[
                  styles.datePickerButton,
                  errors.starts_at && styles.inputError,
                  isEditing && styles.datePickerButtonDisabled
                ]}
                onPress={openStartDatePicker}
                disabled={isEditing}
              >
                <Feather name="calendar" size={20} color={isEditing ? '#999' : '#4CAF50'} />
                <Text style={[styles.datePickerText, !value && styles.placeholderText, isEditing && styles.textDisabled]}>
                  {value ? formatDate(value) : 'Select start date and time'}
                </Text>
                <Feather name="chevron-down" size={20} color={isEditing ? '#999' : '#666'} />
              </TouchableOpacity>

              {Platform.OS === 'android' && showStartPicker && (
                <DateTimePicker
                  value={tempStartDate}
                  mode={pickerMode}
                  is24Hour={true}
                  display="default"
                  onChange={onStartDateChange}
                  onTouchCancel={onStartPickerCancel}
                />
              )}

              {Platform.OS === 'ios' && showStartPicker && (
                <Modal
                  transparent={true}
                  animationType="slide"
                  visible={showStartPicker}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowStartPicker(false)}>
                          <Text style={styles.modalCancel}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Select Start Date & Time</Text>
                        <TouchableOpacity onPress={() => setShowStartPicker(false)}>
                          <Text style={styles.modalDone}>Done</Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={tempStartDate}
                        mode="datetime"
                        is24Hour={true}
                        display="spinner"
                        onChange={onStartDateChange}
                        style={styles.iosPicker}
                      />
                    </View>
                  </View>
                </Modal>
              )}
            </>
          )}
        />
        {formattedStartDate && (
          <Text style={styles.datePreview}>Selected: {formattedStartDate}</Text>
        )}
        {errors.starts_at && (
          <Text style={styles.errorText}>{errors.starts_at.message}</Text>
        )}
      </View>

      {/* End Date with Picker */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>End Date & Time <Text style={styles.required}>*</Text></Text>
        <Controller
          control={control}
          name="ends_at"
          render={({ field: { onChange, value } }) => (
            <>
              <TouchableOpacity
                style={[
                  styles.datePickerButton,
                  errors.ends_at && styles.inputError,
                  isEditing && styles.datePickerButtonDisabled
                ]}
                onPress={openEndDatePicker}
                disabled={isEditing}
              >
                <Feather name="calendar" size={20} color={isEditing ? '#999' : '#4CAF50'} />
                <Text style={[styles.datePickerText, !value && styles.placeholderText, isEditing && styles.textDisabled]}>
                  {value ? formatDate(value) : 'Select end date and time'}
                </Text>
                <Feather name="chevron-down" size={20} color={isEditing ? '#999' : '#666'} />
              </TouchableOpacity>

              {Platform.OS === 'android' && showEndPicker && (
                <DateTimePicker
                  value={tempEndDate}
                  mode={pickerMode}
                  is24Hour={true}
                  display="default"
                  onChange={onEndDateChange}
                  onTouchCancel={onEndPickerCancel}
                />
              )}

              {Platform.OS === 'ios' && showEndPicker && (
                <Modal
                  transparent={true}
                  animationType="slide"
                  visible={showEndPicker}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowEndPicker(false)}>
                          <Text style={styles.modalCancel}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Select End Date & Time</Text>
                        <TouchableOpacity onPress={() => setShowEndPicker(false)}>
                          <Text style={styles.modalDone}>Done</Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={tempEndDate}
                        mode="datetime"
                        is24Hour={true}
                        display="spinner"
                        onChange={onEndDateChange}
                        style={styles.iosPicker}
                      />
                    </View>
                  </View>
                </Modal>
              )}
            </>
          )}
        />
        {formattedEndDate && (
          <Text style={styles.datePreview}>Selected: {formattedEndDate}</Text>
        )}
        {errors.ends_at && (
          <Text style={styles.errorText}>{errors.ends_at.message}</Text>
        )}
      </View>

      {/* Total Questions and Marks */}
      <View style={styles.row}>
        <View style={[styles.formGroup, styles.halfWidth]}>
          <Text style={styles.label}>Total Questions</Text>
          <Controller
            control={control}
            name="total_questions"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.total_questions && styles.inputError, isEditing && styles.inputDisabled]}
                placeholder="Optional"
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                editable={!isEditing}
              />
            )}
          />
          {errors.total_questions && (
            <Text style={styles.errorText}>{errors.total_questions.message}</Text>
          )}
        </View>

        <View style={[styles.formGroup, styles.halfWidth]}>
          <Text style={styles.label}>Total Marks</Text>
          <Controller
            control={control}
            name="total_marks"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.total_marks && styles.inputError, isEditing && styles.inputDisabled]}
                placeholder="Optional"
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                editable={!isEditing}
              />
            )}
          />
          {errors.total_marks && (
            <Text style={styles.errorText}>{errors.total_marks.message}</Text>
          )}
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Instructions</Text>
        <Controller
          control={control}
          name="instructions"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, styles.textArea, isEditing && styles.inputDisabled]}
              placeholder="Enter exam instructions"
              multiline
              numberOfLines={4}
              value={value}
              onChangeText={onChange}
              editable={!isEditing}
            />
          )}
        />
      </View>

      {/* Negative Marking */}
      <View style={styles.checkboxGroup}>
        <Controller
          control={control}
          name="negative_marking"
          render={({ field: { onChange, value } }) => (
            <TouchableOpacity 
              style={styles.checkboxItem}
              onPress={() => !isEditing && onChange(!value)}
              disabled={isEditing}
            >
              <View style={[styles.checkbox, value && styles.checked, isEditing && styles.checkboxDisabled]}>
                {value && <Feather name="check" size={16} color="#fff" />}
              </View>
              <Text style={[styles.checkboxLabel, isEditing && styles.textDisabled]}>Enable Negative Marking</Text>
            </TouchableOpacity>
          )}
        />

        {negativeMarking && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Negative Marks <Text style={styles.required}>*</Text></Text>
            <Controller
              control={control}
              name="negative_marks"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.negative_marks && styles.inputError, isEditing && styles.inputDisabled]}
                  placeholder="Enter negative marks (e.g., 0.5 or 1)"
                  keyboardType="decimal-pad"
                  value={value}
                  onChangeText={onChange}
                  editable={!isEditing}
                />
              )}
            />
            {errors.negative_marks && (
              <Text style={styles.errorText}>{errors.negative_marks.message}</Text>
            )}
          </View>
        )}
      </View>

      {/* Additional Options */}
      <View style={styles.checkboxGroup}>
        <Controller
          control={control}
          name="shuffle_questions"
          render={({ field: { onChange, value } }) => (
            <TouchableOpacity 
              style={styles.checkboxItem}
              onPress={() => !isEditing && onChange(!value)}
              disabled={isEditing}
            >
              <View style={[styles.checkbox, value && styles.checked, isEditing && styles.checkboxDisabled]}>
                {value && <Feather name="check" size={16} color="#fff" />}
              </View>
              <Text style={[styles.checkboxLabel, isEditing && styles.textDisabled]}>Shuffle Questions</Text>
            </TouchableOpacity>
          )}
        />

        <Controller
          control={control}
          name="shuffle_options"
          render={({ field: { onChange, value } }) => (
            <TouchableOpacity 
              style={styles.checkboxItem}
              onPress={() => !isEditing && onChange(!value)}
              disabled={isEditing}
            >
              <View style={[styles.checkbox, value && styles.checked, isEditing && styles.checkboxDisabled]}>
                {value && <Feather name="check" size={16} color="#fff" />}
              </View>
              <Text style={[styles.checkboxLabel, isEditing && styles.textDisabled]}>Shuffle Options</Text>
            </TouchableOpacity>
          )}
        />

        <Controller
          control={control}
          name="fullscreen_required"
          render={({ field: { onChange, value } }) => (
            <TouchableOpacity 
              style={styles.checkboxItem}
              onPress={() => !isEditing && onChange(!value)}
              disabled={isEditing}
            >
              <View style={[styles.checkbox, value && styles.checked, isEditing && styles.checkboxDisabled]}>
                {value && <Feather name="check" size={16} color="#fff" />}
              </View>
              <Text style={[styles.checkboxLabel, isEditing && styles.textDisabled]}>Fullscreen Required</Text>
            </TouchableOpacity>
          )}
        />

        <Controller
          control={control}
          name="auto_submit"
          render={({ field: { onChange, value } }) => (
            <TouchableOpacity 
              style={styles.checkboxItem}
              onPress={() => !isEditing && onChange(!value)}
              disabled={isEditing}
            >
              <View style={[styles.checkbox, value && styles.checked, isEditing && styles.checkboxDisabled]}>
                {value && <Feather name="check" size={16} color="#fff" />}
              </View>
              <Text style={[styles.checkboxLabel, isEditing && styles.textDisabled]}>Auto Submit</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Submit Button - Hidden in edit mode */}
      {!isEditing && (
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Feather name="check-circle" size={24} color="#fff" />
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Creating...' : 'Create Exam'}
          </Text>
        </TouchableOpacity>
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
  containerDisabled: {
    backgroundColor: '#fafafa',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  viewOnlyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  viewOnlyText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#333',
  },
  required: {
    color: '#FF3B30',
  },
  hintText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    fontStyle: 'italic',
  },
  datePreview: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  pickerDisabled: {
    backgroundColor: '#f5f5f5',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  checkboxGroup: {
    marginBottom: 16,
    gap: 8,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxDisabled: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
  },
  checked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
  },
  textDisabled: {
    color: '#999',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 10,
    marginTop: 8,
    marginBottom: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Date Picker Styles
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    gap: 10,
  },
  datePickerButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc',
  },
  datePickerText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  // Modal Styles for iOS
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCancel: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  modalDone: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  iosPicker: {
    height: 200,
  },
})

export default AddExamForm