import { configureStore } from "@reduxjs/toolkit";
import studentExamReducer from "./examSlice/studentExamSlice";
import leaveReducer from "./leaveSlice";
import marksReducer from "./slices/markSlices";
import postReducer from "./postSlice";
import authReducer from "./slices/authSlice";
import classNotesReduce from "./slices/classNoteSlice";
import noticeRducer from "./slices/noticeSlice";
import studentReducer from "./studentSlice";
import timeTableReducer from "./timeTableSlice";
import teacherExamReducer from './examSlice/teacherExamSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    student: studentReducer,
    timeTable: timeTableReducer,
    posts: postReducer,
    leave: leaveReducer,
    notice: noticeRducer,
    classNotes: classNotesReduce,
    marks: marksReducer,
    studentExam: studentExamReducer,
    teacherExam: teacherExamReducer,
  },
});
