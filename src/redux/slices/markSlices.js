import { company } from "@/constants/string";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice } from "@reduxjs/toolkit";


const markSlice = createSlice({
  name: 'marks',
  initialState: {
    getAllMarksData:'',
    marksEntryData:''
  },
  reducers: {
    setGetAllMarksData: (state,actions) => {
      state.getAllMarksData =  actions.payload;
    },
    setMarksEntryData: (state,actions) => {
      state.marksEntryData =  actions.payload;
    }
  }
})

export const { setGetAllMarksData ,setMarksEntryData } = markSlice.actions

export default markSlice.reducer ;

//teacher api call 
export const getAllMarks = async()=>{
     const token = JSON.parse(await AsyncStorage.getItem("token"))
        const res = await fetch(`${company.BASE_URL}/teacher/marks/exams`,{
            method:"GET",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
}

export const getEntryMarksApiCall = async(payload)=>{
     const token = JSON.parse(await AsyncStorage.getItem("token") )
        const res = await fetch(`${company.BASE_URL}/teacher/marks/${payload?.examId}/class?class_id=${payload?.classId}&section_id=${payload?.sectionId}`,{
            method:"GET",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
}

export const classMarksSaveApiCall = async(payload,examId)=> {
        const token = JSON.parse(await AsyncStorage.getItem("token"))
        const res = await fetch(`${company.BASE_URL}/teacher/marks/${examId}/class`,{
            method:"POST",
            body:JSON.stringify(payload),
            headers:{
               'Content-Type':'application/json',
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
}

export const studentMarksSaveApiCall = async(payload,examId,studentId)=> {
        const token = JSON.parse(await AsyncStorage.getItem("token") )
        const res = await fetch(`${company.BASE_URL}/teacher/marks/${examId}/student/${studentId}`,{
            method:"POST",
            body:JSON.stringify(payload),
            headers:{
               'Content-Type':'application/json',
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
}