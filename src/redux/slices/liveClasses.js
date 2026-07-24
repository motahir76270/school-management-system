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