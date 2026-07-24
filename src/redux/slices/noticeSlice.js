import { company } from "@/constants/string";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice } from "@reduxjs/toolkit";


const noticeSlice = createSlice({
  name: 'notice',
  initialState: {
    noticeData:'',
    holidayData:''
  },
  reducers: {
    setNoticeData: (state,actions) => {
      state.noticeData =  actions.payload;
    },
    setHolidayData: (state,actions) => {
      state.holidayData =  actions.payload;
    }
  }
})

export const { setNoticeData , setHolidayData } = noticeSlice.actions

export default noticeSlice.reducer ;

// student api call
export const getStudentNoticeData = async()=> { 
  const token = JSON.parse(await AsyncStorage.getItem("token"))
        const res = await fetch(`${company.BASE_URL}/student/notices`,{
            method:"GET",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
} 

export const getStudentHolidayData = async()=> { 
  const token = JSON.parse(await AsyncStorage.getItem("token"))
        const res = await fetch(`${company.BASE_URL}/student/holidays`,{
            method:"GET",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
} 

// teacher api call
export const getTeacherNoticeData = async()=> { 
  const token = JSON.parse(await AsyncStorage.getItem("token"))
        const res = await fetch(`${company.BASE_URL}/teacher/notices`,{
            method:"GET",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
} 

export const getTeacherHolidayData = async()=> { 
  const token = JSON.parse(await AsyncStorage.getItem("token") )
        const res = await fetch(`${company.BASE_URL}/teacher/holidays`,{
            method:"GET",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
} 