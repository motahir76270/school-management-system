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