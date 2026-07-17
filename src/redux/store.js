import { configureStore } from "@reduxjs/toolkit";
import authReducer from './authSlice'
import studentReducer from './studentSlice'
import postReducer from './postSlice'
import timeTableReducer from './timeTableSlice'
import leaveReducer from './leaveSlice'
import noticeRducer from './noticeSlice'
import classNotesReduce from './classNoteSlice'
import marksReducer from './markSlices'


export const store = configureStore({
  reducer:{
    auth: authReducer,
    student: studentReducer,
    timeTable: timeTableReducer,
    posts:postReducer,
    leave:leaveReducer,
    notice:noticeRducer,
    classNotes:classNotesReduce,
    marks:marksReducer
  },
})