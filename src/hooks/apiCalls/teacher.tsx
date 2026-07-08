import { company } from "@/constants/string";
import { setPostData } from "@/redux/postSlice";
import { setTimeTableData } from "@/redux/timeTableSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

export const getTeacherAttendance = async (month: any) => {
  const token = JSON.parse((await AsyncStorage.getItem("token")) as any);
  const res = await fetch(
    `${company.BASE_URL}/teacher/my-attendance?month=${month}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await res.json();
  return data;
};

export const getStudentSectionTypes = async () => {
  const token = JSON.parse((await AsyncStorage.getItem("token")) as any);
  const res = await fetch(`${company.BASE_URL}/teacher/attendance/classes`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  return data;
};

export const getStudentAttendanceList = async (payload: any) => {
  const token = JSON.parse((await AsyncStorage.getItem("token")) as any);
  const res = await fetch(
    `${company.BASE_URL}/teacher/attendance/?school_class_id=${payload.class_id}&section_id=${payload.section_id}&date=${payload.date}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await res.json();

  return data;
};

export const updateStudentAttendance = async (payload: any) => {
  const token = JSON.parse((await AsyncStorage.getItem("token")) as any);
  const res = await fetch(`${company.BASE_URL}/teacher/attendance`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  return data;
};

export const getAttendanceHistory = async (payload: any) => {
  const token = JSON.parse((await AsyncStorage.getItem("token")) as any);
  const res = await fetch(
    `${company.BASE_URL}/teacher/attendance/history?month=${payload.month}&school_class_id=${payload.class_id}&section_id=${payload.section_id}&search=${payload.search}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await res.json();
  return data;
};

export const markAttendanceByQRScan = async (payload: any) => {
  const token = JSON.parse((await AsyncStorage.getItem("token")) as any);
  const res = await fetch(`${company.BASE_URL}/attendance/qr-scan`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data;
};

export const QrScanLookup = async (payload: any) => {
  const token = JSON.parse((await AsyncStorage.getItem("token")) as any);
  const res = await fetch(`${company.BASE_URL}/teacher/attendance/qr-lookup`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data;
};

export const qrMarkAttendance = async (payload: any) => {
  const token = JSON.parse((await AsyncStorage.getItem("token")) as any);
  const res = await fetch(`${company.BASE_URL}/teacher/attendance/qr-mark`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data;
};

export const getTeacherTimeTable = async (dispatch: any) => {
  try {
    const token = JSON.parse((await AsyncStorage.getItem("token")) as any);
    const res = await fetch(`${company.BASE_URL}/teacher/timetable`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (data?.success === true) {
      dispatch(setTimeTableData(data));
      return data;
    } else {
      Alert.alert("Failed", data?.message);
      return data;
    }
  } catch (error: any) {
    Alert.alert(
      "Failed",
      error?.message || "Server not responed! Please Check internet",
    );
  }
};

export const getSalaryHistory = async (month: any) => {
  const token = JSON.parse((await AsyncStorage.getItem("token")) as any);
  console.log(token);

  const res = await fetch(`${company.BASE_URL}/teacher/salary-report`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();

  return data;
};

export const getTeacherPostData = async (dispatch: any) => {
  try {
    const token = JSON.parse((await AsyncStorage.getItem("token")) as any);
    const res = await fetch(`${company.BASE_URL}/teacher/posts`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (data?.success === true) {
      dispatch(setPostData(data));
      return data;
    } else {
      Alert.alert("Failed", data?.message);
      return data;
    }
  } catch (error: any) {
    Alert.alert(
      "Failed",
      error?.message || "Server not responed! Please Check internet",
    );
  }
};

export const getTeacherLeaveData = async (month: any) => {
  // month=2026-06
  const token = JSON.parse((await AsyncStorage.getItem("token")) as any);
  const res = await fetch(`${company.BASE_URL}/teacher/leaves`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  return data;
};

export const requestTeacherLeave = async (payload: any) => {
  const token = JSON.parse((await AsyncStorage.getItem("token")) as any);
  const res = await fetch(`${company.BASE_URL}/teacher/leaves`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  return data;
};

export const getTeacherNoticeData = async()=> { 
  const token = JSON.parse(await AsyncStorage.getItem("token") as any)
        const res = await fetch(`${company.BASE_URL}/teacher/notices`,{
            method:"GET",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
} 

export const getTeacherHolidayData = async()=> { 
  const token = JSON.parse(await AsyncStorage.getItem("token") as any)
        const res = await fetch(`${company.BASE_URL}/teacher/holidays`,{
            method:"GET",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
} 

export const getTecaherClassNotesOption = async()=>{
     const token = JSON.parse(await AsyncStorage.getItem("token") as any)
        const res = await fetch(`${company.BASE_URL}/teacher/class-notes/classes`,{
            method:"GET",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
}

export const getTecaherClassNotesList = async(payload:any)=>{
     const token = JSON.parse(await AsyncStorage.getItem("token") as any)
        const res = await fetch(`${company.BASE_URL}/teacher/class-notes?school_class_id=${payload?.school_class_id}&section_id=${payload?.section_id}&subject_id=${payload?.subject_id}`,{
            method:"GET",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
}

export const createClassNotes = async(payload:any) => {
      const token = JSON.parse(await AsyncStorage.getItem("token") as any)
        const res = await fetch(`${company.BASE_URL}/teacher/class-notes`,{
            method:"POST",
            body:payload,
            headers:{
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
}

export const deteleClassNotes = async(id:any)=>{
     const token = JSON.parse(await AsyncStorage.getItem("token") as any)
        const res = await fetch(`${company.BASE_URL}/teacher/class-notes/${id}`,{
            method:"DELETE",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        
        const data = await res.json()
     return data;
}
