import { createSlice } from "@reduxjs/toolkit";
import { company } from "@/constants/string";
import { Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const studentMCQSlice = createSlice({
  name: 'studentExam',
  initialState: {
    getExamData: null,
    getExamStartData: null,
    examResult: null,
    examQuestions: null,
    loading: false
  },
  reducers: {
    setExamData: (state, actions) => {
      state.getExamData = actions.payload;
    },
    setExamStartData: (state, actions) => {
      state.getExamStartData = actions.payload;
    },
    setExamQuestions: (state, actions) => {
      state.examQuestions = actions.payload;
    },
    setExamResult: (state, actions) => {
      state.examResult = actions.payload;
    },
    setLoading: (state, actions) => {
      state.loading = actions.payload;
    },
    resetExamState: (state) => {
      state.examQuestions = null;
      state.examResult = null;
      state.getExamStartData = null;
    }
  }
})

export const { 
  setExamData, 
  setExamResult, 
  setExamStartData, 
  setExamQuestions, 
  setLoading,
  resetExamState 
} = studentMCQSlice.actions;

export default studentMCQSlice.reducer;

// Token helper function
export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    return token ? JSON.parse(token) : null;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

// API Functions
export const getMCQExamData = async (dispatch) => {
  try {
    dispatch(setLoading(true));
    
    const token = await getToken();
    if (!token) {
      Alert.alert("Error", "Please login again");
      return;
    }

    const response = await fetch(`${company.BASE_URL}/student/online-mcq`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    });

    const res = await response.json();
    
    if (res.success === true) {
      dispatch(setExamData(res));
    } else {
      Alert.alert("Failed", res?.message || "Failed to load exams");
    }
  } catch (error) {
    console.error("Error in getMCQExamData:", error);
    Alert.alert("Failed", "Server not responding! Please check internet connection");
  } finally {
    dispatch(setLoading(false));
  }
};

export const startMCQExamApiCall = async (id, dispatch) => {
  try {
    dispatch(setLoading(true));
    
    const token = await getToken();
    if (!token) {
      Alert.alert("Error", "Please login again");
      return;
    }

    const response = await fetch(`${company.BASE_URL}/student/online-mcq/${id}/start`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const res = await response.json();
    
    if (res.success === true) {
      dispatch(setExamStartData(res));
      return res;
    } else {
      Alert.alert("Failed", res?.message || "Failed to start exam");
      return null;
    }
  } catch (error) {
    console.error("Error in startMCQExamApiCall:", error);
    Alert.alert("Failed", "Server not responding! Please check internet connection");
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

export const getMCQExamQuestionsApiCall = async (id, dispatch) => {
  console.log(id);
  
  try {
    dispatch(setLoading(true));
    
    const token = await getToken();
    if (!token) {
      Alert.alert("Error", "Please login again");
      return;
    }

    const response = await fetch(`${company.BASE_URL}/student/online-mcq/attempts/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    });
  const res = await response.json()
    if (res.success === true) {
      dispatch(setExamQuestions(res));
      return res;
    } else {
      Alert.alert("Failed", res?.message || "Failed to load questions");
      return null;
    }
  } catch (error) {
    console.error("Error in getMCQExamQuestionsApiCall:", error);
    Alert.alert("Failed", "Server not responding! Please check internet connection");
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

export const getNextMcqQuestionsApiCall = async (data, id, dispatch) => {
  try {
    const token = await getToken();
    if (!token) {
      Alert.alert("Error", "Please login again");
      return;
    }

    const response = await fetch(`${company.BASE_URL}/student/online-mcq/attempts/${id}/answer`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    });

    const res = await response.json();
    
    if (res.success === true) {
      return res;
    } else {
      Alert.alert("Failed", res?.message || "Failed to save answer");
      return null;
    }
  } catch (error) {
    console.error("Error in getNextMcqQuestionsApiCall:", error);
    Alert.alert("Failed", "Server not responding! Please check internet connection");
    return null;
  }
};

export const getSubmitExamTestApiCall = async (data, id, dispatch) => {
  try {
    dispatch(setLoading(true));
    
    const token = await getToken();
    if (!token) {
      Alert.alert("Error", "Please login again");
      return;
    }

    const response = await fetch(`${company.BASE_URL}/student/online-mcq/attempts/${id}/submit`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    });

    const res = await response.json();
    
    if (res.success === true) {
      // Get result after submission
      await getResultExamApiCall(id, dispatch);
      return res;
    } else {
      Alert.alert("Failed", res?.message || "Failed to submit exam");
      return null;
    }
  } catch (error) {
    console.error("Error in getSubmitExamTestApiCall:", error);
    Alert.alert("Failed", "Server not responding! Please check internet connection");
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

export const getResultExamApiCall = async (id, dispatch) => {
  try {
    dispatch(setLoading(true));
    
    const token = await getToken();
    if (!token) {
      Alert.alert("Error", "Please login again");
      return;
    }

    const response = await fetch(`${company.BASE_URL}/student/online-mcq/${id}/result`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    });

    const res = await response.json();
    
    if (res.success === true) {
      dispatch(setExamResult(res));
      return res;
    } else {
      Alert.alert("Failed", res?.message || "Failed to get results");
      return null;
    }
  } catch (error) {
    console.error("Error in getResultExamApiCall:", error);
    Alert.alert("Failed", "Server not responding! Please check internet connection");
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};