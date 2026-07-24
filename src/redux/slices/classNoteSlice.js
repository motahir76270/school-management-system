import { company } from "@/constants/string";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice } from "@reduxjs/toolkit";


const classNotesSlice = createSlice({
  name: 'classNotes',
  initialState: {
    classTypes:"",
    list:'',
  },
  reducers: {
    setClassNotesType: (state,actions) => {
      state.classTypes =  actions.payload;
    },
    setClassNotesData: (state,actions) => {
      state.list =  actions.payload;
    },
    deleteClassNotes: (state,actions) => {
      state.list =  actions.payload;
    }
  }
})

export const {setClassNotesType, setClassNotesData , deleteClassNotes } = classNotesSlice.actions

export default classNotesSlice.reducer ;

// tecaher api call
export const getTecaherClassNotesOption = async()=>{
     const token = JSON.parse(await AsyncStorage.getItem("token") )
        const res = await fetch(`${company.BASE_URL}/teacher/class-notes/classes`,{
            method:"GET",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
}

export const getTecaherClassNotesList = async(payload)=>{
     const token = JSON.parse(await AsyncStorage.getItem("token") )
        const res = await fetch(`${company.BASE_URL}/teacher/class-notes?school_class_id=${payload?.school_class_id}&section_id=${payload?.section_id}&subject_id=${payload?.subject_id}`,{
            method:"GET",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
}

export const createClassNotes = async(payload) => {
      const token = JSON.parse(await AsyncStorage.getItem("token"))
        const res = await fetch(`${company.BASE_URL}/teacher/class-notes`,{
            method:"POST",
            body:payload,
            headers:{
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
}

export const deteleClassNotes = async(id)=>{
     const token = JSON.parse(await AsyncStorage.getItem("token"))
        const res = await fetch(`${company.BASE_URL}/teacher/class-notes/${id}`,{
            method:"DELETE",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
}

/// student api call
export const getStudentClassNotesOption = async()=>{
     const token = JSON.parse(await AsyncStorage.getItem("token"))
        const res = await fetch(`${company.BASE_URL}/student/class-notes/subjects`,{
            method:"GET",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
}

export const getStudentClassNotesList = async(subjectId)=>{
     const token = JSON.parse(await AsyncStorage.getItem("token"))
        const res = await fetch(`${company.BASE_URL}/student/class-notes?subject_id=${subjectId}`,{
            method:"GET",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
}