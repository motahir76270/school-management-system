import { View, Text } from 'react-native'
import React from 'react'
import { useSelector } from 'react-redux'

const StudentClassNotes = () => {
  const { list, classTypes } = useSelector((state: any) => state.classNotes)
  console.log(classTypes);
  
     
  return (
    <View>
      <Text>Student</Text>
    </View>
  )
}

export default StudentClassNotes;