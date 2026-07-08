import { createSlice } from "@reduxjs/toolkit";


const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:'',
    forgetPasword:''
  },
  reducers: {
    setUser: (state,actions) => {
      state.user =  actions.payload;
    },
    setCustomerList: (state,actions) => {
      state.customerList =  actions.payload;
    }
  }
})

export const { setCustomerList ,setUser} = authSlice.actions

export default authSlice.reducer ;