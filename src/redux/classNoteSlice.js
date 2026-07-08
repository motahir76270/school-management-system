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