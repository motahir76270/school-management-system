import { View, Text, Alert, useColorScheme } from 'react-native'
import React, { useEffect, useState } from 'react'
import HeaderSection from '@/components/features/header'
import { FullScreenLoader } from '@/hooks/use-screensLoder'

import { useDispatch, useSelector } from 'react-redux'

import { Colors } from '@/constants/theme'
import TeacherMarksEntry from '@/components/features/teachers/marksEntry'
import { getAllMarks, setGetAllMarksData } from '@/redux/slices/markSlices'

const Exams = () => {
    const scheme = useColorScheme();
    const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const [loading, setLoading] = useState(false);

  const { user } = useSelector((state: any) => state.auth);

  
  const dispatch = useDispatch()
  const fetchAllExamData = async()=> {
    try {
      setLoading(true)
     const res = await getAllMarks();
     if(res?.success === true){
       dispatch(setGetAllMarksData(res))
     }else{
       Alert.alert("Failed", res?.message)
     }
     } catch (error:any) {
       Alert.alert("Failed", error?.message || "server not responsed")
       
    }finally{
      setLoading(false)
    }
  }
  useEffect(()=> {
    if(user?.role === "teacher"){
      fetchAllExamData();
    }
  },[dispatch])

  return (
    <View>
      <HeaderSection title="Exams" />
      <TeacherMarksEntry loading={loading} setLoading={setLoading} />
      <FullScreenLoader loading={loading} />
    </View>
  )
}

export default Exams