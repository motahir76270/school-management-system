import { company } from "@/constants/string"
import { setPostData } from "@/redux/postSlice";

import { setTimeTableData } from "@/redux/timeTableSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

export const getStudentAttendance = async(month:any)=> { 
  const token = JSON.parse(await AsyncStorage.getItem("token") as any)
        const res = await fetch(`${company.BASE_URL}/student/attendance?month=${month}`,{
            method:"GET",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
} 

export const getStudentFeeData = async()=> { 
  const token = JSON.parse(await AsyncStorage.getItem("token") as any)
        const res = await fetch(`${company.BASE_URL}/student/fees`,{
            method:"GET",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()        
     return data;
} 

export const getStudentTimeTable = async(dispatch:any) => {
    try {
    
           const token = JSON.parse(await AsyncStorage.getItem("token") as any)
            const res = await fetch(`${company.BASE_URL}/student/timetable`,{
            method:"GET",
            headers:{   
                Authorization: `Bearer ${token}`
            }
        })
      const data = await res.json()
        if(data?.success === true){
               dispatch(setTimeTableData(data))
         return data;
        }else{
           Alert.alert("Failed", data?.message)
         return data;
        }
    } catch (error:any) {
           Alert.alert("Failed", error?.message || "Server not responed! Please Check internet")
     }  
}

export const getStudentPostData = async(dispatch:any)=> {

    try {
    
       const token = JSON.parse(await AsyncStorage.getItem("token") as any)
        const res = await fetch(`${company.BASE_URL}/student/posts`,{
            method:"GET",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json();
      if(data?.success === true){
        dispatch(setPostData(data))
         return data;
        }else{
           Alert.alert("Failed", data?.message)
         return data;
        }
    } catch (error:any) {
           Alert.alert("Failed", error?.message || "Server not responed! Please Check internet")          
    }
}

export const getStudentLeaveData = async(month:any)=> { 
  const token = JSON.parse(await AsyncStorage.getItem("token") as any)
        const res = await fetch(`${company.BASE_URL}/student/leaves`,{
            method:"GET",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
} 

export const requestStudentLeave = async(payload:any)=> { 
  const token = JSON.parse(await AsyncStorage.getItem("token") as any)
        const res = await fetch(`${company.BASE_URL}/student/leaves`,{
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

export const getStudentNoticeData = async()=> { 
  const token = JSON.parse(await AsyncStorage.getItem("token") as any)
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
  const token = JSON.parse(await AsyncStorage.getItem("token") as any)
        const res = await fetch(`${company.BASE_URL}/student/holidays`,{
            method:"GET",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
} 

export const getStudentClassNotesOption = async()=>{
     const token = JSON.parse(await AsyncStorage.getItem("token") as any)
        const res = await fetch(`${company.BASE_URL}/student/class-notes/subjects`,{
            method:"GET",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
}

export const getStudentClassNotesList = async(subjectId:any)=>{
     const token = JSON.parse(await AsyncStorage.getItem("token") as any)
        const res = await fetch(`${company.BASE_URL}/student/class-notes?subject_id=${subjectId}`,{
            method:"GET",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
}

export const  intiateTransaction = async(id:any)=>{
    const token = JSON.parse(await AsyncStorage.getItem("token") as any)
        const res = await fetch(`${company.BASE_URL}/student/fees/${id}/pay`,{
            method:"POST",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
}

export const  varifyTransaction = async(id:any,payload:any)=>{
    const token = JSON.parse(await AsyncStorage.getItem("token") as any)
        const res = await fetch(`${company.BASE_URL}/student/fees/${id}/verify`,{
            method:"POST",
            body:JSON.stringify(payload),
            headers:{
                "Content-Type":'application/json',
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
}

<<<<<<< HEAD
=======
export const getAllStudentsReports = async()=>{
     const token = JSON.parse(await AsyncStorage.getItem("token") as any)
        const res = await fetch(`${company.BASE_URL}/student/report-cards`,{
            method:"GET",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
}

export const getStudentsReportsById = async(id:any)=>{
     const token = JSON.parse(await AsyncStorage.getItem("token") as any)
        const res = await fetch(`${company.BASE_URL}/student/report-cards/${id}`,{
            method:"GET",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
}

export const getAllStudentsAdminCrads = async()=>{
     const token = JSON.parse(await AsyncStorage.getItem("token") as any)
        const res = await fetch(`${company.BASE_URL}/student/admit-cards`,{
            method:"GET",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
}

export const getStudentsAdminCArdById = async(id:any)=>{
     const token = JSON.parse(await AsyncStorage.getItem("token") as any)
        const res = await fetch(`${company.BASE_URL}/student/admit-cards/${id}`,{
            method:"GET",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
}

export const getStudentsAdminCardPdfById = async(id:any)=>{
     const token = JSON.parse(await AsyncStorage.getItem("token") as any)
        const res = await fetch(`${company.BASE_URL}/student/admit-cards/${id}/print`,{
            method:"GET",
            headers:{ 
                Authorization: `Bearer ${token}`,
            }
        })
        
     return res;
}

export const getStudentResults = async()=>{
     const token = JSON.parse(await AsyncStorage.getItem("token") as any)
        const res = await fetch(`${company.BASE_URL}/student/results`,{
            method:"GET",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
}



>>>>>>> 6266e1af86fd3a2df8d4290e452c6170c838dcbc
