import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import React, { useState } from 'react'
import { Feather } from '@expo/vector-icons'
import { useDispatch } from 'react-redux'
import { addExamQuestionsApiCall } from '@/redux/examSlice/teacherExamSlice'
import { Picker } from '@react-native-picker/picker'

interface AddQuestionFormProps {
  examId: string
  questionTypes: any[]
}

const AddQuestionForm = ({ examId, questionTypes }: AddQuestionFormProps) => {
  const dispatch = useDispatch()
  const [questionData, setQuestionData] = useState({
    question: '', // Changed from question_text to question
    question_type: 'mcq_single',
    marks: '',
    options: ['', '', '', ''],
    correct_answer: '', // Will store 'A', 'B', 'C', 'D'
  })
  const [showOptions, setShowOptions] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleAddQuestion = async () => {
    // Validate question text
    if (!questionData.question.trim()) {
      Alert.alert('Error', 'Please enter question text')
      return
    }

    // Validate for MCQ type
    if (questionData.question_type === 'mcq_single') {
      // Check if all options are filled
      if (questionData.options.some(opt => !opt.trim())) {
        Alert.alert('Error', 'Please fill all options')
        return
      }
      if (!questionData.correct_answer) {
        Alert.alert('Error', 'Please select correct answer')
        return
      }
    }

    setLoading(true)

    // Prepare payload according to API expectations
    const payload: any = {
      question: questionData.question.trim(),
      question_type: questionData.question_type,
      marks: parseInt(questionData.marks) || 1,
    }

    // Add options and correct_answer only for MCQ
    if (questionData.question_type === 'mcq_single') {
      payload.options = questionData.options.map(opt => opt.trim())
      payload.correct_answer = questionData.correct_answer // This should be 'A', 'B', 'C', or 'D'
    }

    try {
      const result = await addExamQuestionsApiCall(dispatch, examId, payload)
      if (result?.success) {
        // Reset form on success
        setQuestionData({
          question: '',
          question_type: 'mcq_single',
          marks: '',
          options: ['', '', '', ''],
          correct_answer: '',
        })  
      }
    } catch (error) {
      // Alert.alert('Error', 'Failed to add question. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getOptionLabel = (index: number) => {
    return String.fromCharCode(65 + index) // A, B, C, D
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Add Question</Text>

      {/* Question Type */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Question Type <Text style={styles.required}>*</Text></Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={questionData.question_type}
            onValueChange={(value) => {
              setQuestionData({ 
                ...questionData, 
                question_type: value,
                options: value === 'mcq_single' ? ['', '', '', ''] : [],
                correct_answer: ''
              })
              setShowOptions(value === 'mcq_single')
            }}
            style={styles.picker}
          >
            {questionTypes.map((type: any) => (
              <Picker.Item key={type.key} label={type.label} value={type.key} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Question Text */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Question Text <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter question text"
          multiline
          numberOfLines={3}
          value={questionData.question}
          onChangeText={(text) => setQuestionData({ ...questionData, question: text })}
        />
      </View>

      {/* Marks */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Marks</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter marks (default: 1)"
          keyboardType="numeric"
          value={questionData.marks}
          onChangeText={(text) => setQuestionData({ ...questionData, marks: text })}
        />
      </View>

      {/* Options - Only for MCQ */}
      {showOptions && (
        <>
          <Text style={styles.subLabel}>Options <Text style={styles.required}>*</Text></Text>
          {questionData.options.map((option, index) => (
            <View key={index} style={styles.optionRow}>
              <Text style={styles.optionLabel}>{getOptionLabel(index)}.</Text>
              <TextInput
                style={[styles.input, styles.optionInput]}
                placeholder={`Option ${getOptionLabel(index)}`}
                value={option}
                onChangeText={(text) => {
                  const newOptions = [...questionData.options]
                  newOptions[index] = text
                  setQuestionData({ ...questionData, options: newOptions })
                }}
              />
            </View>
          ))}

          {/* Correct Answer Selection */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Correct Answer <Text style={styles.required}>*</Text></Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={questionData.correct_answer}
                onValueChange={(value) => setQuestionData({ ...questionData, correct_answer: value })}
                style={styles.picker}
              >
                <Picker.Item label="Select Correct Answer" value="" />
                {questionData.options.map((option, index) => {
                  const label = getOptionLabel(index)
                  return (
                    <Picker.Item 
                      key={index} 
                      label={`${label}. ${option || `Option ${label}`}`} 
                      value={label} // Store 'A', 'B', 'C', 'D'
                    />
                  )
                })}
              </Picker>
            </View>
          </View>
        </>
      )}

      {/* Add Button */}
      <TouchableOpacity 
        style={[styles.addButton, loading && styles.addButtonDisabled]} 
        onPress={handleAddQuestion}
        disabled={loading}
      >
        <Feather name="plus-circle" size={24} color="#fff" />
        <Text style={styles.addButtonText}>
          {loading ? 'Adding...' : 'Add Question'}
        </Text>
      </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
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
  subLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 4,
    color: '#333',
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    width: 24,
    color: '#333',
  },
  optionInput: {
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 10,
    marginTop: 8,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})

export default AddQuestionForm