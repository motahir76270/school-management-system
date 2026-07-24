import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  useColorScheme,
  ActivityIndicator,
  AppState,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { Colors } from '@/constants/theme';
import HeaderSection from '@/components/features/header';
import { 
  getMCQExamQuestionsApiCall, 
  getNextMcqQuestionsApiCall, 
  getSubmitExamTestApiCall,
  resetExamState 
} from '@/redux/examSlice/studentExamSlice';
import { FullScreenLoader } from '@/hooks/use-screensLoder';

const ExamScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  
  const { examQuestions, loading } = useSelector((state: any) => state?.studentExam);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<any>({});
  const [textAnswers, setTextAnswers] = useState<any>({});
  const [remainingTime, setRemainingTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examEndTime, setExamEndTime] = useState(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [examId, setExamId] = useState(null);
  const timerRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const hasAutoSubmitted = useRef(false);
  const textInputTimeout = useRef(null);

  // Load questions on mount
  useEffect(() => {
    if (id) {
      loadQuestions();
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (textInputTimeout.current) {
        clearTimeout(textInputTimeout.current);
      }
      subscription.remove();
      dispatch(resetExamState());
    };
  }, [id]);

  // Timer effect - starts when questions are loaded
  useEffect(() => {
    if (examQuestions?.remaining_seconds !== undefined && examQuestions?.remaining_seconds !== null) {
      setRemainingTime(examQuestions.remaining_seconds);
      
      if (examQuestions?.exam?.id) {
        setExamId(examQuestions.exam.id);
      }
      
      const endTime: any = new Date();
      endTime.setSeconds(endTime.getSeconds() + examQuestions.remaining_seconds);
      setExamEndTime(endTime);
      
      if (!examQuestions.exam?.is_submitted) {
        startTimer();
      }
    }
  }, [examQuestions]);

  const handleAppStateChange = (nextAppState: any) => {
    if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
      if (examEndTime) {
        const now: any = new Date();
        const remaining = Math.floor((examEndTime - now) / 1000);
        if (remaining > 0) {
          setRemainingTime(remaining);
        } else {
          handleTimeUp();
        }
      }
    }
    appStateRef.current = nextAppState;
  };

  const loadQuestions = async () => {
    const result:any = await getMCQExamQuestionsApiCall(id, dispatch);
    if (result?.questions?.length > 0) {
      const initialAnswers: any = {};
      const initialTextAnswers: any = {};
      
      result.questions.forEach((q: any) => {
        if (q.saved_answer) {
          // For MCQ questions with options
          if (q.question_type === 'mcq_single' || q.question_type === 'mcq_multiple') {
            initialAnswers[q.id] = q.saved_answer;
          } 
          // For fill_blank / subjective questions
          else if (q.question_type === 'fill_blank' || q.question_type === 'subjective' || q.question_type === 'text') {
            initialTextAnswers[q.id] = q.saved_answer;
          }
        }
      });
      
      setSelectedAnswers(initialAnswers);
      setTextAnswers(initialTextAnswers);
      
      if (result?.exam?.id) {
        setExamId(result.exam.id);
      }
    }
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeUp = async () => {
    if (hasAutoSubmitted.current) return;
    hasAutoSubmitted.current = true;

    setIsTimeUp(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    Alert.alert(
      "⏰ Time's Up!",
      "Your exam time has ended. Submitting automatically...",
      [
        { 
          text: "OK", 
          onPress: async () => {
            await autoSubmitExam();
          } 
        }
      ],
      { cancelable: false }
    );
  };

  const autoSubmitExam = async () => {
    const submissionData = prepareSubmissionData();
    setIsSubmitting(true);
    
    try {
      const result = await getSubmitExamTestApiCall(submissionData, id, dispatch);
      
      if (result) {
        Alert.alert(
          "Exam Submitted",
          "Your exam has been automatically submitted.",
          [
            { 
              text: "View Results", 
              onPress: () => {
                const examIdToUse = examId || id;
                router.push(`/screens/student/exam/result/${examIdToUse}` as any);
              } 
            }
          ],
          { cancelable: false }
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to submit exam. Please try again.");
    } finally {
      setIsSubmitting(false);
      hasAutoSubmitted.current = false;
    }
  };

  const prepareSubmissionData = () => {
    const data:any = [];
    
    // Add MCQ answers
    Object.entries(selectedAnswers).forEach(([questionId, answer]) => {
      if (answer !== null && answer !== undefined && answer !== '') {
        data.push({
          question_id: questionId,
          answer: answer
        });
      }
    });
    
    // Add Text/Fill_blank answers
    Object.entries(textAnswers).forEach(([questionId, answer]) => {
      if (answer !== null && answer !== undefined && answer !== '') {
        data.push({
          question_id: questionId,
          answer: answer
        });
      }
    });
    
    return data;
  };

  const formatTime = (seconds: any) => {
    if (seconds < 0) seconds = 0;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (remainingTime < 60) return '#dc3545';
    if (remainingTime < 300) return '#ffc107';
    return colors.text;
  };

  const handleMCQAnswerSelect = async (questionId: any, answer: any) => {
    if (isTimeUp || remainingTime <= 0) {
      Alert.alert("Time's Up", "You cannot answer questions after time is up.");
      return;
    }

    setSelectedAnswers((prev: any) => ({
      ...prev,
      [questionId]: answer
    }));

    const data = {
      question_id: questionId,
      answer: answer
    };

    const result = await getNextMcqQuestionsApiCall(data, id, dispatch);
    if (result) {
      if (result.remaining_seconds !== undefined) {
        setRemainingTime(result.remaining_seconds);
        const newEndTime: any = new Date();
        newEndTime.setSeconds(newEndTime.getSeconds() + result.remaining_seconds);
        setExamEndTime(newEndTime);
      }
    }
  };

  const handleTextAnswerChange = (questionId: any, text: any) => {
    if (isTimeUp || remainingTime <= 0) {
      Alert.alert("Time's Up", "You cannot answer questions after time is up.");
      return;
    }

    // Update local state immediately
    setTextAnswers((prev: any) => ({
      ...prev,
      [questionId]: text
    }));

    // Debounce API call
    if (textInputTimeout.current) {
      clearTimeout(textInputTimeout.current);
    }

    textInputTimeout.current = setTimeout(async () => {
      const data = {
        question_id: questionId,
        answer: text
      };

      const result = await getNextMcqQuestionsApiCall(data, id, dispatch);
      if (result) {
        if (result.remaining_seconds !== undefined) {
          setRemainingTime(result.remaining_seconds);
          const newEndTime: any = new Date();
          newEndTime.setSeconds(newEndTime.getSeconds() + result.remaining_seconds);
          setExamEndTime(newEndTime);
        }
      }
    }, 500); // Wait 500ms before saving
  };

  const handleNext = () => {
    if (currentQuestionIndex < examQuestions?.questions?.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (isTimeUp || remainingTime <= 0) {
      Alert.alert("Time's Up", "Your exam has been automatically submitted.");
      return;
    }

    Alert.alert(
      "Submit Exam",
      `You have answered ${answeredCount} out of ${totalQuestions} questions.\n\nAre you sure you want to submit? You cannot change answers after submission.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Submit", 
          style: "destructive",
          onPress: handleConfirmSubmit 
        }
      ]
    );
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    
    const submissionData = prepareSubmissionData();

    try {
      const result = await getSubmitExamTestApiCall(submissionData, id, dispatch);
      
      if (result) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        
        Alert.alert(
          "Success",
          "Exam submitted successfully!",
          [
            { 
              text: "View Results", 
              onPress: () => {
                const examIdToUse = examId || id;
                router.push(`/screens/student/exam/result/${examIdToUse}` as any);
              } 
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to submit exam. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuestionSelect = (index: any) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestionIndex(index);
    }
  };

  const isQuestionAnswered = (question: any) => {
    if (question.question_type === 'mcq_single' || question.question_type === 'mcq_multiple') {
      const answer = selectedAnswers[question.id];
      return answer !== null && answer !== undefined && answer !== '';
    } else if (question.question_type === 'fill_blank' || question.question_type === 'subjective' || question.question_type === 'text') {
      const answer = textAnswers[question.id];
      return answer !== null && answer !== undefined && answer !== '';
    }
    return false;
  };

  const getQuestionTypeIcon = (type: any) => {
    switch(type) {
      case 'mcq_single':
        return '🔘';
      case 'mcq_multiple':
        return '☑️';
      case 'fill_blank':
        return '✏️';
      case 'subjective':
        return '📝';
      case 'text':
        return '📝';
      default:
        return '❓';
    }
  };

  const getQuestionTypeLabel = (type: any) => {
    switch(type) {
      case 'mcq_single':
        return 'MCQ';
      case 'mcq_multiple':
        return 'Multiple Choice';
      case 'fill_blank':
        return 'Fill in the Blank';
      case 'subjective':
        return 'Subjective';
      case 'text':
        return 'Text Answer';
      default:
        return 'Unknown';
    }
  };

  if (!examQuestions?.questions || loading) {
    return <FullScreenLoader loading={true} />;
  }

  const questions = examQuestions.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = questions.filter((q: any) => isQuestionAnswered(q)).length;

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <HeaderSection title="Exam" />
      
      <View style={{ padding: 16, flex: 1 }}>
        {/* Header with Progress and Timer */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
          backgroundColor: colors.card,
          padding: 12,
          borderRadius: 8,
          flexWrap: 'wrap'
        }}>
          <Text style={{ color: colors.text, fontSize: 14 }}>
            Q {currentQuestionIndex + 1}/{totalQuestions}
          </Text>
          <Text style={{ color: colors.text, fontSize: 14 }}>
            ✅ {answeredCount}/{totalQuestions}
          </Text>
          <Text style={{ 
            color: getTimerColor(),
            fontWeight: 'bold',
            fontSize: 16,
            backgroundColor: remainingTime < 60 ? 'rgba(220, 53, 69, 0.1)' : 'transparent',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4
          }}>
            ⏱ {formatTime(remainingTime)}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={{
          height: 4,
          backgroundColor: colors.border || '#e0e0e0',
          borderRadius: 2,
          marginBottom: 12,
          overflow: 'hidden'
        }}>
          <View style={{
            height: '100%',
            width: `${(answeredCount / totalQuestions) * 100}%`,
            backgroundColor: remainingTime < 60 ? '#dc3545' : colors.primary,
            borderRadius: 2
          }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Question */}
          <View style={{ 
            backgroundColor: colors.card,
            padding: 16,
            borderRadius: 8,
            marginBottom: 16
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                <Text style={{ 
                  fontSize: 14, 
                  color: colors.textSecondary,
                  fontWeight: '500'
                }}>
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </Text>
                <Text style={{ 
                  marginLeft: 8,
                  fontSize: 12,
                  color: colors.primary,
                  backgroundColor: colors.background,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 4
                }}>
                  {getQuestionTypeIcon(currentQuestion.question_type)} {getQuestionTypeLabel(currentQuestion.question_type)}
                </Text>
              </View>
              <Text style={{ color: colors.textSecondary }}>
                Marks: {currentQuestion.marks}
              </Text>
            </View>
            
            <Text style={{ 
              fontSize: 18, 
              color: colors.text,
              marginBottom: 16,
              lineHeight: 26
            }}>
              {currentQuestion.question}
            </Text>

            {/* MCQ Options - for mcq_single and mcq_multiple */}
            {(currentQuestion.question_type === 'mcq_single' || currentQuestion.question_type === 'mcq_multiple') && (
              <>
                {currentQuestion.options && Object.keys(currentQuestion.options).length > 0 ? (
                  Object.entries(currentQuestion.options).map(([key, value]) => {
                    const isSelected = selectedAnswers[currentQuestion.id] === key;
                    return (
                      <TouchableOpacity
                        key={key}
                        style={{
                          padding: 14,
                          marginVertical: 4,
                          backgroundColor: isSelected ? colors.primary : colors.background,
                          borderRadius: 8,
                          borderWidth: 2,
                          borderColor: isSelected ? colors.primary : (colors.border || '#e0e0e0'),
                          flexDirection: 'row',
                          alignItems: 'center'
                        }}
                        onPress={() => handleMCQAnswerSelect(currentQuestion.id, key)}
                        disabled={isSubmitting || isTimeUp || remainingTime <= 0}
                      >
                        <View style={{
                          width: 24,
                          height: 24,
                          borderRadius: currentQuestion.question_type === 'mcq_single' ? 12 : 4,
                          backgroundColor: isSelected ? 'white' : 'transparent',
                          borderWidth: 2,
                          borderColor: isSelected ? 'white' : colors.textSecondary,
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 12
                        }}>
                          {isSelected && (
                            <View style={{
                              width: currentQuestion.question_type === 'mcq_single' ? 12 : 16,
                              height: currentQuestion.question_type === 'mcq_single' ? 12 : 16,
                              borderRadius: currentQuestion.question_type === 'mcq_single' ? 6 : 2,
                              backgroundColor: 'white'
                            }} />
                          )}
                        </View>
                        <Text style={{ 
                          color: isSelected ? 'white' : colors.text,
                          fontSize: 16,
                          flex: 1
                        }}>
                          {key}. {value}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={{
                    padding: 12,
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    borderRadius: 6
                  }}>
                    <Text style={{ color: '#856404' }}>
                      ⚠️ No options available for this question
                    </Text>
                  </View>
                )}
              </>
            )}

            {/* Fill in the Blank / Subjective / Text Answer */}
            {(currentQuestion.question_type === 'fill_blank' || 
              currentQuestion.question_type === 'subjective' || 
              currentQuestion.question_type === 'text') && (
              <View>
                <Text style={{ 
                  color: colors.textSecondary, 
                  fontSize: 14, 
                  marginBottom: 8 
                }}>
                  Type your answer below:
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: 8,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: colors.border || '#e0e0e0',
                    color: colors.text,
                    minHeight: 120,
                    textAlignVertical: 'top',
                    fontSize: 16,
                    ...(Platform.OS === 'ios' ? { paddingVertical: 12 } : {})
                  }}
                  multiline
                  numberOfLines={4}
                  placeholder="Write your answer here..."
                  placeholderTextColor={colors.textSecondary}
                  value={textAnswers[currentQuestion.id] || ''}
                  onChangeText={(text) => handleTextAnswerChange(currentQuestion.id, text)}
                  editable={!isSubmitting && !isTimeUp && remainingTime > 0}
                />
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between',
                  marginTop: 8
                }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                    {textAnswers[currentQuestion.id]?.length || 0} characters
                  </Text>
                  {textAnswers[currentQuestion.id] && textAnswers[currentQuestion.id].length > 0 && (
                    <Text style={{ color: '#28a745', fontSize: 12 }}>
                      ✅ Saved
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Question Status */}
            {isQuestionAnswered(currentQuestion) && (
              <View style={{
                marginTop: 12,
                padding: 8,
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                borderRadius: 6
              }}>
                <Text style={{ color: '#28a745', fontSize: 12 }}>
                  ✅ Answer saved
                </Text>
              </View>
            )}
          </View>

          {/* Navigation Buttons */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            marginBottom: 20
          }}>
            <TouchableOpacity
              style={{
                padding: 12,
                backgroundColor: colors.card,
                borderRadius: 8,
                flex: 0.3,
                alignItems: 'center',
                opacity: currentQuestionIndex === 0 ? 0.5 : 1
              }}
              onPress={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <Text style={{ color: colors.text }}>⬅ Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                padding: 12,
                backgroundColor: colors.primary,
                borderRadius: 8,
                flex: 0.3,
                alignItems: 'center'
              }}
              onPress={() => {
                Alert.alert(
                  "Jump to Question",
                  `Enter question number (1-${totalQuestions})`,
                  [
                    { text: "Cancel", style: "cancel" },
                    { 
                      text: "Go", 
                      onPress: (input: any) => {
                        const num = parseInt(input);
                        if (num >= 1 && num <= totalQuestions) {
                          setCurrentQuestionIndex(num - 1);
                        } else {
                          Alert.alert("Invalid", `Please enter a number between 1 and ${totalQuestions}`);
                        }
                      }
                    }
                  ],

                );
              }}
            >
              <Text style={{ color: 'white' }}>🔢 Jump</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                padding: 12,
                backgroundColor: colors.card,
                borderRadius: 8,
                flex: 0.3,
                alignItems: 'center',
                opacity: currentQuestionIndex === totalQuestions - 1 ? 0.5 : 1
              }}
              onPress={handleNext}
              disabled={currentQuestionIndex === totalQuestions - 1}
            >
              <Text style={{ color: colors.text }}>Next ➡</Text>
            </TouchableOpacity>
          </View>

          {/* Question Status Indicator */}
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: 16,
            padding: 12,
            backgroundColor: colors.card,
            borderRadius: 8
          }}>
            {questions.map((q: any, index: any) => {
              const answered = isQuestionAnswered(q);
              return (
                <TouchableOpacity
                  key={index}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: answered ? '#28a745' : colors.border || '#e0e0e0',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: 4,
                    borderWidth: currentQuestionIndex === index ? 2 : 0,
                    borderColor: currentQuestionIndex === index ? colors.primary : 'transparent'
                  }}
                  onPress={() => handleQuestionSelect(index)}
                >
                  <Text style={{
                    color: answered ? 'white' : colors.textSecondary,
                    fontSize: 12,
                    fontWeight: currentQuestionIndex === index ? 'bold' : 'normal'
                  }}>
                    {index + 1}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Question Type Legend */}
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: 16,
            gap: 8
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 4 }}>
              <Text style={{ fontSize: 12 }}>🔘 MCQ</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 4 }}>
              <Text style={{ fontSize: 12 }}>✏️ Fill in the Blank</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 4 }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#28a745', marginRight: 4 }} />
              <Text style={{ fontSize: 12 }}>Answered</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 4 }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.border || '#e0e0e0', marginRight: 4 }} />
              <Text style={{ fontSize: 12 }}>Not Answered</Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={{
              padding: 16,
              backgroundColor: isTimeUp || remainingTime <= 0 ? '#6c757d' : '#dc3545',
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 20,
              opacity: isSubmitting ? 0.6 : 1
            }}
            onPress={handleSubmit}
            disabled={isSubmitting || isTimeUp || remainingTime <= 0}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                {isTimeUp || remainingTime <= 0 ? '⏰ Time Expired' : '📤 Submit Exam'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Warning when time is low */}
          {remainingTime < 300 && remainingTime > 0 && (
            <View style={{
              padding: 12,
              backgroundColor: remainingTime < 60 ? '#dc3545' : '#ffc107',
              borderRadius: 8,
              marginBottom: 12
            }}>
              <Text style={{
                color: remainingTime < 60 ? 'white' : '#856404',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                ⚠️ {remainingTime < 60 ? 'Less than 1 minute remaining!' : 'Less than 5 minutes remaining!'}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ExamScreen;