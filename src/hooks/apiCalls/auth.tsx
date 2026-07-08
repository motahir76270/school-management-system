import { company } from "@/constants/string"
import { setUser } from "@/redux/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Alert } from "react-native";

export const LoginApiCall = async(payload:any)=> { 
     const res = await fetch(`${company.BASE_URL}/login`,{
        method:"POST",
        body:JSON.stringify(payload),
        headers:{
            "Content-Type":"application/json"
        }
     })
     const data = await res.json()
     
     return data;
} 

export const loagoutApiCall = async()=> { 
    const token = JSON.parse(await AsyncStorage.getItem("token") as any);
        const res = await fetch(`${company.BASE_URL}/logout`,{
            method:"POST",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        const data = await res.json()
        if(data?.success === true){
            Alert.alert("Success", data?.message)
            await AsyncStorage.removeItem('token')
            await AsyncStorage.removeItem('user')
            router.replace("/(auth)/login")
        }else{
            Alert.alert("Failed", data?.message)
            router.replace("/(auth)/login")
        }
} 

export const forgetPasswordApiCall = async(payload:any)=> { 
     const res = await fetch(`${company.BASE_URL}/forget-password`,{
        method:"POST",
        body:JSON.stringify(payload),
        headers:{
            "Content-Type":"application/json"
        }
     })
     const data = await res.json()
     return data;
} 

export const getTeacherProfile = async(dispatch:any)=> { 
    const token = JSON.parse(await AsyncStorage.getItem("token") as any);
        const res = await fetch(`${company.BASE_URL}/teacher/profile`,{
            method:"GET",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        const data = await res.json()
     
        if(data?.success === true){
          await AsyncStorage.setItem("user", JSON.stringify(data))
          const parsedUser = JSON.parse( await AsyncStorage.getItem("user") as any)
           dispatch(setUser(parsedUser?.user))
        }else if(data?.code === "SESSION_INVALIDATED"){
            Alert.alert(data?.code, data?.message )
            router.replace('/(auth)/login')
        }
        else{
            Alert.alert("Failed", data?.message)
        }    
     return data;
} 

export const getStudentProfile = async(dispatch:any)=> { 
    const token = JSON.parse(await AsyncStorage.getItem("token") as any);
        const res = await fetch(`${company.BASE_URL}/student/profile`,{
            method:"GET",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
   
        const data = await res.json()

         
        if(data?.success === true){
          await AsyncStorage.setItem("user", JSON.stringify(data))
          const parsedUser = JSON.parse( await AsyncStorage.getItem("user") as any)
           dispatch(setUser(parsedUser?.user))
        }else if(data?.code === "SESSION_INVALIDATED"){
            Alert.alert(data?.code, data?.message )
            router.replace('/(auth)/login')
        }else{
            Alert.alert("Failed", data?.message)
        }
        
     return data;
} 

export const teacherPasswordChange = async(payload:any)=> { 
    const token = JSON.parse(await AsyncStorage.getItem("token") as any);
     const res = await fetch(`${company.BASE_URL}/teacher/change-password`,{
        method:"POST",
        body:JSON.stringify(payload),
        headers:{
            "Content-Type":"application/json",
        Authorization: `Bearer ${token}`,
        }
     })
     const data = await res.json()
     return data;
} 

export const studentPasswordChange = async(payload:any)=> { 
    const token = JSON.parse(await AsyncStorage.getItem("token") as any);
     const res = await fetch(`${company.BASE_URL}/student/change-password`,{
        method:"POST",
        body:JSON.stringify(payload),
        headers:{
            "Content-Type":"application/json",
        Authorization: `Bearer ${token}`,
        }
     })
     const data = await res.json()
     return data;
}

