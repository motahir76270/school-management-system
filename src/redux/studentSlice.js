import { createSlice } from "@reduxjs/toolkit";


const studentSlice = createSlice({
  name: 'student',
  initialState: {
    feesData:''
  },
  reducers: {
    setFeesData: (state,actions) => {
      state.feesData =  actions.payload;
    }
  }
})

export const { setFeesData  } = studentSlice.actions

export default studentSlice.reducer ;