import { createSlice } from "@reduxjs/toolkit";


const leaveSlice = createSlice({
  name: 'leave',
  initialState: {
    leaveData:''
  },
  reducers: {
    setLeaveData: (state,actions) => {
      state.leaveData =  actions.payload;
    }
  }
})

export const { setLeaveData  } = leaveSlice.actions

export default leaveSlice.reducer ;