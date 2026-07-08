import { createSlice } from "@reduxjs/toolkit";


const timeTableSlice = createSlice({
  name: 'timeTable',
  initialState: {
    timeTableData:''
  },
  reducers: {
    setTimeTableData: (state,actions) => {
      state.timeTableData =  actions.payload;
    }
  }
})

export const {setTimeTableData} = timeTableSlice.actions

export default timeTableSlice.reducer ;