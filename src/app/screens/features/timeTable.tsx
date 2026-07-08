import { View, Text, Alert } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import HeaderSection from '@/components/features/header'
import TeacherTimeTable from '@/components/features/teachers/timeTable'
import StudentTimeTable from '@/components/features/students/timeTable'
import { useDispatch, useSelector } from 'react-redux'
import { getStudentTimeTable } from '@/hooks/apiCalls/student'
import { getTeacherTimeTable } from '@/hooks/apiCalls/teacher'
import { FullScreenLoader } from '@/hooks/use-screensLoder'

const TimeTableSreen = () => {
  const { user } = useSelector((state: any) => state.auth);
  const [timeTableData, setTimeTableData] = useState<any>("");
  const [Loading, setLoading] = useState(false)
  const dispatch = useDispatch();
  const TimeTableData = useSelector((state:any)=> state.timeTable.timeTableData)
  
 
  const fetchTableData = async() => {
     setLoading(true)
      let res;
      if(user?.role === "teacher"){
         res = await getTeacherTimeTable(dispatch);
      } else {
        res = await getStudentTimeTable(dispatch);
      }
      if(res?.success === true){
        setTimeTableData(TimeTableData)
        setLoading(false)
      }
  }

  useEffect(() => {
    // Only fetch if it hasn't been loaded before
      fetchTableData();
  }, []) // Empty array, but with ref check
  
  return (
    <View style={{ flex: 1 }}>
      <HeaderSection title="Time Table" />
      {user?.role === "teacher" ? 
        <TeacherTimeTable 
          timeTableData={timeTableData} 
          setTimeTableData={setTimeTableData}
        />
        :
        <StudentTimeTable 
          timeTableData={timeTableData} 
          setTimeTableData={setTimeTableData}
        />
      }
      <FullScreenLoader loading={Loading} />
    </View>
  )
}

export default TimeTableSreen