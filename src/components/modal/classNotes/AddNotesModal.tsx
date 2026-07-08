import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { Ionicons } from '@expo/vector-icons'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as DocumentPicker from 'expo-document-picker'
import ClassValidation from '@/validations/classNotes'
import z from 'zod'
import { createClassNotes } from '@/hooks/apiCalls/teacher'
import { useSelector } from 'react-redux'

interface AddNotesModalProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

export type ClassNoteFormData = z.infer<typeof ClassValidation.classNoteSchema>

interface DropdownOption {
  id?: string
  value?: string
  name?: string
  label?: string
}

interface SelectedFile {
  uri: string
  name: string
  type: string
  size?: number
  base64?: string
}

const AddNotesModal = ({ visible, onClose, onSuccess }: AddNotesModalProps) => {
  const { classTypes } = useSelector((state: any) => state.classNotes)
  const [loading, setLoading] = useState(false)
  const [sectionOptions, setSectionOptions] = useState<DropdownOption[]>([])
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null)
  const [fileUploading, setFileUploading] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, isValid }
  } = useForm<ClassNoteFormData>({
    resolver: zodResolver(ClassValidation.classNoteSchema),
    defaultValues: {
      title: '',
      chapter: '',
      description: '',
      school_class_id: '',
      section_id: '',
      subject_id: '',
      file_type: '',
      file_url: '',
      video_url: ''
    },
    mode: 'onChange'
  })

  const selectedClass = watch('school_class_id')
  const selectedFileType = watch('file_type')

  const classOptions = useMemo(() => classTypes?.classes || [], [classTypes])
  const subjectOptions = useMemo(() => classTypes?.subjects || [], [classTypes])
  const fileTypeOptions = useMemo(() => classTypes?.file_types || [], [classTypes])

  useEffect(() => {
    if (selectedClass && classTypes?.classes) {
      const selectedClassData = classTypes.classes.find(
        (cls: any) => cls.id === selectedClass
      )
      if (selectedClassData?.sections) {
        setSectionOptions(selectedClassData.sections)
      } else {
        setSectionOptions([])
      }
      setValue('section_id', '')
    } else {
      setSectionOptions([])
      setValue('section_id', '')
    }
  }, [selectedClass, classTypes, setValue])

  useEffect(() => {
    if (!visible) {
      reset()
      setSelectedFile(null)
    }
  }, [visible, reset])

  // Convert file to base64 using the new File API
  const fileToBase64 = useCallback(async (uri: string): Promise<string> => {
    try {
      const response = await fetch(uri)
      const blob = await response.blob()
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          // Remove data URL prefix (e.g., "data:image/png;base64,")
          const base64Data = result.split(',')[1] || result
          resolve(base64Data)
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.error('Error converting file to base64:', error)
      throw error
    }
  }, [])

  const handleFileSelect = useCallback(async () => {
    if (!selectedFileType) {
      Alert.alert('Error', 'Please select a file type first')
      return
    }

    try {
      setFileUploading(true)
      
      const allowedTypes: Record<string, string[]> = {
        'pdf': ['application/pdf'],
        'doc': ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        'ppt': ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
        'pptx': ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
        'xls': ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        'xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        'video': ['video/mp4', 'video/mpeg', 'video/quicktime'],
        'audio': ['audio/mpeg', 'audio/wav', 'audio/ogg']
      }

      const allowedMimeTypes = allowedTypes[selectedFileType] || ['*/*']

      const result = await DocumentPicker.getDocumentAsync({
        type: allowedMimeTypes,
        copyToCacheDirectory: true,
        multiple: false
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0]
        
        // Convert to base64 using the new File API
        let base64 = ''
        try {
          base64 = await fileToBase64(file.uri)
        } catch (error) {
          console.warn('Failed to convert file to base64:', error)
        }

        setSelectedFile({
          uri: file.uri,
          name: file.name || 'file',
          type: file.mimeType || 'application/octet-stream',
          size: file.size,
          base64: base64 || undefined
        })

        setValue('file_url', file.uri)
      }
    } catch (error) {
      console.error('File selection error:', error)
      Alert.alert('Error', 'Failed to select file. Please try again.')
    } finally {
      setFileUploading(false)
    }
  }, [selectedFileType, setValue, fileToBase64])

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null)
    setValue('file_url', '')
  }, [setValue])

  const onSubmit = useCallback(async (data: ClassNoteFormData) => {
    if (loading) return
    
    if (selectedFileType && !selectedFile) {
      Alert.alert('Error', 'Please upload a file')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      
      formData.append('title', data.title.trim())
      formData.append('chapter', data.chapter?.trim() || '')
      formData.append('description', data.description?.trim() || '')
      formData.append('school_class_id', data.school_class_id)
      formData.append('section_id', data.section_id || '')
      formData.append('subject_id', data.subject_id || '')
      formData.append('file_type', data.file_type || '')
      formData.append('video_url', data.video_url?.trim() || '')

      if (selectedFile) {
        // For React Native, we need to handle file upload differently
        const fileData = {
          uri: selectedFile.uri,
          type: selectedFile.type,
          name: selectedFile.name
        }
        formData.append('file', fileData as any)
      }

      const res = await createClassNotes(formData)
      
      if (res?.success === true) {
        Alert.alert('Success', res?.message)
        reset()
        setSelectedFile(null)
        onSuccess()
        onClose()
      } else {
        Alert.alert('Failed', res?.message || 'Failed to add note')
      }
    } catch (error: any) {
      console.error('Submit error:', error)
      Alert.alert(
        'Error', 
        error?.message || 'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }, [loading, selectedFileType, selectedFile, reset, onSuccess, onClose])

  const handleClose = useCallback(() => {
    if (isDirty || selectedFile) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to close?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => {
              reset()
              setSelectedFile(null)
              onClose()
            }
          }
        ]
      )
    } else {
      reset()
      setSelectedFile(null)
      onClose()
    }
  }, [isDirty, selectedFile, reset, onClose])

  const renderPickerField = useCallback((
    name: keyof ClassNoteFormData,
    label: string,
    options: DropdownOption[],
    placeholder: string,
    enabled: boolean = true,
    labelKey: string = 'name',
    valueKey: string = 'id'
  ) => {
    const isRequired = ['school_class_id', 'subject_id', 'file_type'].includes(name)
    
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          {label}
          {isRequired && <Text style={styles.requiredStar}> *</Text>}
        </Text>
        <View style={[
          styles.pickerWrapper,
          errors[name] && styles.pickerError,
          !enabled && styles.pickerDisabled
        ]}>
          <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value } }) => (
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={styles.picker}
                enabled={enabled}
                dropdownIconColor={enabled ? "#6B7280" : "#D1D5DB"}
              >
                <Picker.Item label={placeholder} value="" />
                {options.map((item) => {
                  const key = item[valueKey as keyof DropdownOption] || item.id || item.value
                  const label = item[labelKey as keyof DropdownOption] || item.name || item.label || String(key)
                  const value = item[valueKey as keyof DropdownOption] || item.id || item.value || ''
                  
                  return (
                    <Picker.Item 
                      key={String(key)} 
                      label={String(label)} 
                      value={String(value || '')} 
                    />
                  )
                })}
              </Picker>
            )}
          />
        </View>
        {errors[name] && (
          <Text style={styles.errorText}>{errors[name]?.message}</Text>
        )}
      </View>
    )
  }, [control, errors])

  const renderTextInput = useCallback((
    name: keyof ClassNoteFormData,
    label: string,
    placeholder: string,
    multiline: boolean = false,
    required: boolean = false,
    numberOfLines: number = 1
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.requiredStar}> *</Text>}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[
              styles.input,
              multiline && styles.textArea,
              errors[name] && styles.inputError
            ]}
            placeholder={placeholder}
            value={value || ''}
            onChangeText={onChange}
            multiline={multiline}
            numberOfLines={numberOfLines}
            textAlignVertical={multiline ? 'top' : 'center'}
            editable={!loading}
            returnKeyType={multiline ? 'default' : 'next'}
            blurOnSubmit={true}
          />
        )}
      />
      {errors[name] && (
        <Text style={styles.errorText}>{errors[name]?.message}</Text>
      )}
    </View>
  ), [control, errors, loading])

  const renderFileUpload = useCallback(() => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        Upload File
        {selectedFileType && <Text style={styles.requiredStar}> *</Text>}
      </Text>
      
      {selectedFile ? (
        <View style={styles.fileInfoContainer}>
          <View style={styles.fileInfo}>
            <Ionicons name="document-outline" size={24} color="#2563EB" />
            <View style={styles.fileDetails}>
              <Text style={styles.fileName} numberOfLines={1}>
                {selectedFile.name}
              </Text>
              {selectedFile.size && (
                <Text style={styles.fileSize}>
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Text>
              )}
            </View>
          </View>
          <TouchableOpacity 
            onPress={handleRemoveFile} 
            style={styles.removeFileButton}
            disabled={loading}
          >
            <Ionicons name="close-circle" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.uploadButton,
            (!selectedFileType || loading) && styles.uploadButtonDisabled
          ]}
          onPress={handleFileSelect}
          disabled={!selectedFileType || fileUploading || loading}
        >
          {fileUploading ? (
            <ActivityIndicator color="#2563EB" />
          ) : (
            <View style={styles.uploadButtonContent}>
              <Ionicons name="cloud-upload-outline" size={24} color="#2563EB" />
              <Text style={styles.uploadButtonText}>
                {selectedFileType 
                  ? `Upload ${selectedFileType.toUpperCase()} file`
                  : 'Select file type first'
                }
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
      
      {selectedFileType && !selectedFile && !fileUploading && (
        <Text style={styles.helperText}>
          Please upload a {selectedFileType.toUpperCase()} file
        </Text>
      )}
    </View>
  ), [selectedFileType, selectedFile, fileUploading, loading, handleFileSelect, handleRemoveFile])

  const isSubmitDisabled = useMemo(() => {
    return !isValid || loading || (selectedFileType && !selectedFile)
  }, [isValid, loading, selectedFileType, selectedFile])

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Ionicons name="add-circle-outline" size={24} color="#2563EB" />
                <Text style={styles.modalHeaderTitle}>Add New Note</Text>
              </View>
              <TouchableOpacity 
                onPress={handleClose} 
                style={styles.closeButton}
                disabled={loading}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.formContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              {renderTextInput('title', 'Title', 'Enter title', false, true)}
              {renderTextInput('chapter', 'Chapter', 'Enter chapter name')}
              {renderTextInput('description', 'Description', 'Enter description (optional)', true, false, 3)}
              {renderPickerField('school_class_id', 'Class', classOptions, 'Select Class')}
              {renderPickerField('section_id', 'Section', sectionOptions, 'Select Section', !!selectedClass)}
              {renderPickerField('subject_id', 'Subject', subjectOptions, 'Select Subject')}
              {renderPickerField('file_type', 'File Type', fileTypeOptions, 'Select File Type', true, 'label', 'value')}
              {renderFileUpload()}
              {renderTextInput('video_url', 'Video URL', 'Enter video URL (optional)')}

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isSubmitDisabled && styles.submitButtonDisabled
                ]}
                onPress={handleSubmit(onSubmit)}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <View style={styles.submitButtonContent}>
                    <Ionicons name="save-outline" size={20} color="white" />
                    <Text style={styles.submitButtonText}>Add Note</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.bottomSpacer} />
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: { 
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    maxHeight: '95%', 
    minHeight: '85%' 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E7EB', 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24 
  },
  modalHeaderLeft: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  modalHeaderTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#1F2937', 
    marginLeft: 8 
  },
  closeButton: { 
    padding: 8 
  },
  formContainer: { 
    flex: 1 
  },
  scrollContent: { 
    padding: 16, 
    paddingBottom: 132 
  },
  fieldContainer: { 
    marginBottom: 16 
  },
  fieldLabel: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: '#4B5563', 
    marginBottom: 4 
  },
  requiredStar: { 
    color: '#EF4444' 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#D1D5DB', 
    borderRadius: 8, 
    padding: 12, 
    backgroundColor: '#F9FAFB', 
    fontSize: 14, 
    color: '#1F2937', 
    minHeight: 44 
  },
  inputError: { 
    borderColor: '#EF4444', 
    borderWidth: 2 
  },
  textArea: { 
    minHeight: 80, 
    paddingTop: 12,
    textAlignVertical: 'top'
  },
  pickerWrapper: { 
    borderWidth: 1, 
    borderColor: '#D1D5DB', 
    borderRadius: 8, 
    backgroundColor: '#F9FAFB', 
    overflow: 'hidden', 
    height: 50,
    justifyContent: 'center'
  },
  pickerError: { 
    borderColor: '#EF4444', 
    borderWidth: 2 
  },
  pickerDisabled: { 
    backgroundColor: '#F3F4F6', 
    borderColor: '#E5E7EB' 
  },
  picker: { 
    height: 50, 
    width: '100%' 
  },
  errorText: { 
    color: '#EF4444', 
    fontSize: 12, 
    marginTop: 4 
  },
  uploadButton: { 
    borderWidth: 2, 
    borderColor: '#2563EB', 
    borderStyle: 'dashed', 
    borderRadius: 8, 
    padding: 16, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#F0F7FF', 
    minHeight: 60 
  },
  uploadButtonDisabled: { 
    borderColor: '#D1D5DB', 
    backgroundColor: '#F9FAFB' 
  },
  uploadButtonContent: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  uploadButtonText: { 
    color: '#2563EB', 
    fontSize: 14, 
    fontWeight: '500', 
    marginLeft: 8 
  },
  fileInfoContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#F0F7FF', 
    padding: 12, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#2563EB' 
  },
  fileInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  fileDetails: { 
    marginLeft: 12, 
    flex: 1 
  },
  fileName: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: '#1F2937' 
  },
  fileSize: { 
    fontSize: 12, 
    color: '#6B7280', 
    marginTop: 2 
  },
  removeFileButton: { 
    padding: 4 
  },
  helperText: { 
    color: '#6B7280', 
    fontSize: 12, 
    marginTop: 4 
  },
  submitButton: { 
    backgroundColor: '#2563EB', 
    paddingVertical: 14, 
    borderRadius: 8, 
    marginTop: 8, 
    shadowColor: '#2563EB', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 2 
  },
  submitButtonDisabled: { 
    backgroundColor: '#93C5FD', 
    shadowOpacity: 0 
  },
  submitButtonContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  submitButtonText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 16, 
    marginLeft: 8 
  },
  bottomSpacer: { 
    height: 20 
  }
})

export default AddNotesModal