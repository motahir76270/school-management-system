// redux/onlineExamSlice.ts
import { showError, showSuccess, showWarning, showInfo } from "@/components/service/AlertService";
import { company } from "@/constants/string";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice } from "@reduxjs/toolkit";

const onlineExamSlice = createSlice({
  name: 'teacherExam',
  initialState: {
    examList: null,
    classSectionTypes: null,
    createExamData: null,
    examQuitionData: null,
    loading: false,
    examReportsList:'',
    examReport:'',
    examAnswerSheet:''
  },
  reducers: {
    setExamList: (state, actions) => {
      state.examList = actions.payload;
    },
    setClassSectionTypes: (state, actions) => {
      state.classSectionTypes = actions.payload;
    },
    setCreateExamData: (state, actions) => {
      state.createExamData = actions.payload;
    },
    setExamQuitionData: (state, actions) => {
      state.examQuitionData = actions.payload;
    },
    deleteExamQuitionData: (state, actions) => {
      state.examQuitionData = actions.payload;
    },
    deleteExam: (state, actions) => {
      state.examList = actions.payload;
    },
    setExamReportsList: (state, actions) => {
      state.examReportsList = actions.payload;
    },
    setExamReport: (state, actions) => {
      state.examReport = actions.payload;
    },
    setExamAnswerSheet: (state, actions) => {
      state.examAnswerSheet = actions.payload;
    },
    setLoading: (state, actions) => {
      state.loading = actions.payload;
    }
  }
})

export const { 
  setExamList, 
  setClassSectionTypes, 
  setCreateExamData, 
  setExamQuitionData,
  deleteExamQuitionData,
  deleteExam,
  setExamReportsList,
  setExamReport,
  setExamAnswerSheet,
  setLoading 
} = onlineExamSlice.actions

export default onlineExamSlice.reducer;

// Get token from AsyncStorage
const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    return token ? JSON.parse(token) : null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

// Get Exam List API Call
export const getExamListApiCall = async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const token = await getToken();
    
    if (!token) {
      showError('Authentication failed. Please login again.');
      return;
    }

    const res = await fetch(`${company.BASE_URL}/teacher/online-mcq`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    const data = await res.json();
    
    if (data?.success === true) {
      dispatch(setExamList(data));
    } else {
      showError(data?.message || 'Failed to load exams');
    }
  } catch (error) {
    showError('Server not responded! Please check internet connection');
  } finally {
    dispatch(setLoading(false));
  }
}

// Delete Exam API Call
export const deleteExamApiCall = async (dispatch, examId) => {
  try {
    dispatch(setLoading(true));
    const token = await getToken();
    
    if (!token) {
      showError('Authentication failed. Please login again.');
      return;
    }

    const res = await fetch(`${company.BASE_URL}/teacher/online-mcq/${examId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    const data = await res.json();
    
    if (data?.success === true) {
      showSuccess(data?.message || 'Exam deleted successfully');
      await getExamListApiCall(dispatch);
    } else {
      showError(data?.message || 'Failed to delete exam');
    }
  } catch (error) {
    showError('Server not responded! Please check internet connection');
  } finally {
    dispatch(setLoading(false));
  }
}

// Get Class Section Types API Call
export const getClassSectionTypesApiCall = async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const token = await getToken();
    
    if (!token) {
      showError('Authentication failed. Please login again.');
      return;
    }

    const res = await fetch(`${company.BASE_URL}/teacher/online-mcq/meta`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    const data = await res.json();
    
    if (data?.success === true) {
      dispatch(setClassSectionTypes(data));
    } else {
      showError(data?.message || 'Failed to load class section types');
    }
  } catch (error) {
    showError('Server not responded! Please check internet connection');
  } finally {
    dispatch(setLoading(false));
  }
}

// Create Online Exam API Call
export const createOnlineExamApiCall = async (dispatch, formData) => {
  try {
    dispatch(setLoading(true));
    const token = await getToken();
    
    if (!token) {
      showError('Authentication failed. Please login again.');
      return null;
    }

    const res = await fetch(`${company.BASE_URL}/teacher/online-mcq`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    
    if (data?.success === true) {
      dispatch(setCreateExamData(data));
      showSuccess(data?.message || 'Exam created successfully');
      return data;
    } else {
      showError(data?.message || 'Failed to create exam');
      return null;
    }
  } catch (error) {
    showError('Server not responded! Please check internet connection');
    return null;
  } finally {
    dispatch(setLoading(false));
  }
}

// Get Exam Questions List API Call
export const getExamQuestionsListApiCall = async (dispatch, examId) => {
  try {
    dispatch(setLoading(true));
    const token = await getToken();
    
    if (!token) {
      showError('Authentication failed. Please login again.');
      return;
    }

    const res = await fetch(`${company.BASE_URL}/teacher/online-mcq/${examId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    const data = await res.json();
    
    if (data?.success === true) {
      dispatch(setExamQuitionData(data));
      showSuccess(data?.message || 'Questions loaded successfully');
    } else {
      showError(data?.message || 'Failed to load questions');
    }
  } catch (error) {
    showError('Server not responded! Please check internet connection');
  } finally {
    dispatch(setLoading(false));
  }
}

// Add Exam Questions API Call
export const addExamQuestionsApiCall = async (dispatch, examId, questionData) => {
  try {
    dispatch(setLoading(true));
    const token = await getToken();
    
    if (!token) {
      showError('Authentication failed. Please login again.');
      return null;
    }

    const res = await fetch(`${company.BASE_URL}/teacher/online-mcq/${examId}/questions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(questionData)
    });
    const data = await res.json();
    
    if (data?.success === true) {
      dispatch(setExamQuitionData(data));
      showSuccess(data?.message || 'Question added successfully');
      return data;
    } else {
      showError(data?.message || 'Failed to add question');
      return null;
    }
  } catch (error) {
    showError('Server not responded! Please check internet connection');
    return null;
  } finally {
    dispatch(setLoading(false));
  }
}

// Delete Exam Questions API Call
export const deleteExamQuestionsApiCall = async (dispatch, examId, questionId) => {
  try {
    dispatch(setLoading(true));
    const token = await getToken();
    
    if (!token) {
      showError('Authentication failed. Please login again.');
      return;
    }

    const res = await fetch(`${company.BASE_URL}/teacher/online-mcq/${examId}/questions/${questionId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    const data = await res.json();
    
    if (data?.success === true) {
      showSuccess(data?.message || 'Question deleted successfully');
      // Refresh questions list after deletion
      await getExamQuestionsListApiCall(dispatch, examId);
    } else {
      showError(data?.message || 'Failed to delete question');
    }
  } catch (error) {
    showError('Server not responded! Please check internet connection');
  } finally {
    dispatch(setLoading(false));
  }
}

// Publish Exam API Call
export const publishExamApiCall = async (dispatch, examId) => {
  try {
    dispatch(setLoading(true));
    const token = await getToken();
    
    if (!token) {
      showError('Authentication failed. Please login again.');
      return null;
    }

    const res = await fetch(`${company.BASE_URL}/teacher/online-mcq/${examId}/publish`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    const data = await res.json();
    
    if (data?.success === true) {
      showSuccess(data?.message || 'Exam published successfully');
      await getExamListApiCall(dispatch);
      return data;
    } else {
      showError(data?.message || 'Failed to publish exam');
      return null;
    }
  } catch (error) {
    showError('Server not responded! Please check internet connection');
    return null;
  } finally {
    dispatch(setLoading(false));
  }
}

/// teacher online exam report api call
export const getExamResportListApiCall = async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const token = await getToken();
    
    if (!token) {
      showError('Authentication failed. Please login again.');
      return;
    }

    const res = await fetch(`${company.BASE_URL}/teacher/online-mcq/reports`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    const data = await res.json();
    
    if (data?.success === true) {
      dispatch(setExamReportsList(data));
    } else {
      showError(data?.message || 'Failed to load exams');
    }
  } catch (error) {
    showError('Server not responded! Please check internet connection');
  } finally {
    dispatch(setLoading(false));
  }
} 

export const getExamResportByIdApiCall = async (dispatch,exam_id) => {
  try {
    dispatch(setLoading(true));
    const token = await getToken();
    
    if (!token) {
      showError('Authentication failed. Please login again.');
      return;
    }

    const res = await fetch(`${company.BASE_URL}/teacher/online-mcq/reports/${exam_id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    const data = await res.json();
    
    if (data?.success === true) {
      dispatch(setExamReport(data));
    } else {
      showError(data?.message || 'Failed to load exams');
    }
  } catch (error) {
    showError('Server not responded! Please check internet connection');
  } finally {
    dispatch(setLoading(false));
  }
} 

export const getExamResportAnswerSheetApiCall = async (dispatch,exam_id , attempt_id) => {
  try {
    dispatch(setLoading(true));
    const token = await getToken();
    
    if (!token) {
      showError('Authentication failed. Please login again.');
      return;
    }

    const res = await fetch(`${company.BASE_URL}/teacher/online-mcq/reports/${exam_id}/attempts/${attempt_id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    const data = await res.json();
    
    if (data?.success === true) {
      dispatch(setExamAnswerSheet(data));
    } else {
      showError(data?.message || 'Failed to load exams');
    }
  } catch (error) {
    showError('Server not responded! Please check internet connection');
  } finally {
    dispatch(setLoading(false));
  }
} 
