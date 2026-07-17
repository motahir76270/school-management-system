import { createSlice } from "@reduxjs/toolkit";


const studentSlice = createSlice({
  name: 'student',
  initialState: {
    feesData:'',
    getAllReports:'',
    reportsData:'',
    admitCardData:'',
    resultData:''
  },
  reducers: {
    setFeesData: (state,actions) => {
      state.feesData =  actions.payload;
    },
    setAllReportsData: (state,actions) =>{
      state.getAllReports =  actions.payload;
    },
    setReportData: (state,actions) => {
      state.reportsData =  actions.payload;
    },
    setAdmitCardData: (state,actions) => {
      state.admitCardData =  actions.payload;
    },
    setResultData: (state,actions) => {
      state.resultData =  actions.payload;
    },


  }
})

export const { setFeesData , setAllReportsData ,setReportData ,setAdmitCardData ,setResultData} = studentSlice.actions

export default studentSlice.reducer ;