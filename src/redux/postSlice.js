import { createSlice } from "@reduxjs/toolkit";


const postSlice = createSlice({
  name: 'posts',
  initialState: {
    postData:''
  },
  reducers: {
    setPostData: (state,actions) => {
      state.postData =  actions.payload;
    }
  }
})

export const { setPostData  } = postSlice.actions

export default postSlice.reducer ;