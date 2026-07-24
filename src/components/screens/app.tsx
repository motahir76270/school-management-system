import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const AppScreens = () => {
  return (
     <Stack initialRouteName='(auth)' screenOptions={{headerShown:false}}>
        <Stack.Screen name='(auth)' />
        <Stack.Screen name='(tabs)' />
        <Stack.Screen name='screens/settings/changePassword' />
        <Stack.Screen name='screens/settings/about' />
        <Stack.Screen name='screens/settings/privacy' />
        <Stack.Screen name='screens/settings/helpCenter' />
        <Stack.Screen name='screens/settings/support' />
        <Stack.Screen name='screens/settings/terms' />
        <Stack.Screen name='screens/settings/attendance' />
        <Stack.Screen name='screens/settings/notices' />
        <Stack.Screen name='screens/settings/markEntry' />
        <Stack.Screen name='screens/settings/ExamShedule' />
        <Stack.Screen name='screens/settings/reportCard' />
        <Stack.Screen name='screens/settings/holidays' />

        {/* teacher screens */}
        <Stack.Screen name='screens/settings/Attendance/history' />
        <Stack.Screen name='screens/settings/Attendance/manual' />
        <Stack.Screen name='screens/settings/Attendance/qrScan' />

        <Stack.Screen name='screens/settings/liveClasses/myClasses' />
        <Stack.Screen name='screens/settings/liveClasses/ClassesReports' />

        <Stack.Screen name='screens/settings/onlineMCQ/examReport/report' />
        <Stack.Screen name='screens/settings/onlineMCQ/examReport/[id]' />
        <Stack.Screen name='screens/settings/onlineMCQ/examReport/answersheet/[id]' />
        <Stack.Screen name='screens/settings/onlineMCQ/onlineExam/exam' />
        <Stack.Screen name='screens/settings/onlineMCQ/onlineExam/createExam' />
        
        

        {/* student screens */}
        <Stack.Screen name='screens/student/exam/onlineExam' />
        <Stack.Screen name='screens/student/exam/[id]' />
        <Stack.Screen name='screens/student/liveClasses/myClasses' />


        <Stack.Screen name='screens/features/assignment' />
        <Stack.Screen name='screens/features/homeWork' />
        <Stack.Screen name='screens/features/myResult' />
        <Stack.Screen name='screens/features/timeTable' />
        <Stack.Screen name='screens/features/leaves' />
        <Stack.Screen name='screens/features/myAttendance' />

        <Stack.Screen name='screens/features/marksEntry/page' />
        <Stack.Screen name='screens/features/marksEntry/classExams/[id]' />

        <Stack.Screen name='screens/features/fees/feeStructure' />
        <Stack.Screen name='screens/features/fees/feeReceipts' />
        <Stack.Screen name='screens/features/fees/[id]' />

        <Stack.Screen name='screens/features/reportsCard/card/[id]' />
        <Stack.Screen name='screens/features/reportsCard/userReports/[id]' />
        <Stack.Screen name='screens/features/reportsCard/allReports' />

        <Stack.Screen name='screens/features/admitCards/card/[id]' />
        <Stack.Screen name='screens/features/admitCards/admitCard/[id]' />
        <Stack.Screen name='screens/features/admitCards/page' />

        <Stack.Screen name='screens/features/slarySlip/history' />
        <Stack.Screen name='screens/features/slarySlip/[id]' />

        
      </Stack>
  )
}

export default AppScreens