import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Switch, Alert, useColorScheme } from 'react-native';
import { Ionicons, MaterialIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { useSelector } from 'react-redux';
import { loagoutApiCall } from '@/redux/slices/authSlice';


export default function SettingsScreen() {
  const { user } = useSelector((state: any) => state.auth);
  const teacherPermission = user?.teacher
  // console.log(teacherPermission?.can_mark_student_attendance);
  
    const scheme = useColorScheme();
    const color = Colors[scheme === 'unspecified' ? 'light' : scheme];

  const SettingItem = ({ title, icon, iconType,screen, hasSwitch, value, onValueChange, hasArrow, isLogout }: any) => {
    const getIcon = () => {
      const props = { size: 22, color: isLogout ? '#ff4444' : Colors.light.primary };
      
      switch (iconType) {
        case 'Ionicons':
          return <Ionicons name={icon} {...props} />;
        case 'MaterialIcons':
          return <MaterialIcons name={icon} {...props} />;
        case 'Feather':
          return <Feather name={icon} {...props} />;
        case 'FontAwesome5':
          return <FontAwesome5 name={icon} {...props} />;
        default:
          return <Ionicons name="settings" {...props} />;
      }
    };

    const handleNavgationBtn = () => {
      if(screen?.length > 0){
         router.push(screen)
      }else{
        Alert.alert('warning', "screen no made yet")
      }
    }

    return (
      <TouchableOpacity style={styles.settingItem} onPress={handleNavgationBtn}>
        <View style={styles.settingLeft}>
          <View style={[styles.iconContainer, isLogout && styles.logoutIconContainer]}>
            {getIcon()}
          </View>
          <Text style={[styles.settingTitle, isLogout && styles.logoutText]}>{title}</Text>
        </View>
        
        {hasSwitch ? (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
            thumbColor={Colors.light.background}
          />
        ) : hasArrow && (
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={isLogout ? '#ff4444' : Colors.light.textSecondary} 
          />
        )}
      </TouchableOpacity>
    );
  };

const handleLogoutBtn = async () => {
  Alert.alert(
    "Logout",
    "Are you sure you want to logout?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            // Your logout logic here
            await loagoutApiCall()
          } catch (error) {
            console.error(error);
          }
        },
      },
    ]
  );
};

  return (
    <View style={styles.container}>
      <LinearGradient         
        colors={ [color.primary, color.tertiary,  color.secondary] }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}>
      <SafeAreaView style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Manage your app preferences</Text>
      </SafeAreaView>
      </LinearGradient>

    <ScrollView style={{paddingBottom:120}}>


      {/* Attendance Section */}
      {
        user?.role === "teacher" && teacherPermission?.can_mark_student_attendance === true &&
       <View style={styles.section}>
        <Text style={styles.sectionTitle}>Attendance</Text>
        <View style={styles.sectionCard}>
         <SettingItem
            title="Manual Attendance"
            icon="finger-print"
            iconType="Ionicons"
            screen="/screens/settings/Attendance/manual"
            hasArrow={true}
          />
          <SettingItem
            title="QR Scan Attendance"
            icon="scan-outline"
            iconType="Ionicons"
            screen="/screens/settings/Attendance/qrScan"
            hasArrow={true}
          />
         <SettingItem
            title="Attendance History"
            icon="time-outline"
            iconType="Ionicons"
            screen="/screens/settings/Attendance/history"
            hasArrow={true}
          />

        </View>
      </View>
      }

      {/* Academic Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Academic</Text>
        <View style={styles.sectionCard}>

          <SettingItem
            title="Notices"
            icon="notifications-outline"
            iconType="Ionicons"
            screen="/screens/settings/notices"
            hasArrow={true}
          />
          <View style={styles.divider} />
 
          <SettingItem
            title="Academic Holidays"
            icon="calendar-outline"
            iconType="Ionicons"
            screen="/screens/settings/holidays"
            hasArrow={true}
          />
          <View style={styles.divider} />
          {/* <SettingItem
            title="Exam Schedule"
            icon="calendar-outline"
            iconType="Ionicons"
            screen="/screens/settings/ExamShedule"
            hasArrow={true}
          />
          <View style={styles.divider} />
          <SettingItem
            title="Reports Card"
            icon="document-text-outline"
            iconType="Ionicons"
            screen="/screens/settings/reportCard"
            hasArrow={true}
          /> */}
    
        </View>
      </View>


      {/* Online MCQ Section */}
     {    user?.role === "teacher" && 
       <View style={styles.section}>
        <Text style={styles.sectionTitle}>Online MCQ</Text>
        <View style={styles.sectionCard}>

          <SettingItem
            title="Online MCQ"
            icon="clipboard-outline"
            iconType="Ionicons"
            screen="/screens/settings/onlineMCQ/onlineExam/exam"
            hasArrow={true}
          />
          <View style={styles.divider} />

          <SettingItem
            title="Exam Reports"
            icon="analytics-outline"
            iconType="Ionicons"
            screen="/screens/settings/onlineMCQ/examReport/report"
            hasArrow={true}
          />

        </View>
      </View>
    }  

      {/* Live Classes Section */}
     {    user?.role === "teacher" && 
       <View style={styles.section}>
        <Text style={styles.sectionTitle}>Live Classes</Text>
        <View style={styles.sectionCard}>

            <SettingItem
            title="My Classes"
            icon="videocam-outline"
            iconType="Ionicons"
            screen="/screens/settings/liveClasses/myClasses"
            hasArrow={true}
          />
          <View style={styles.divider} />

          <SettingItem
            title="Classes Reports"
            icon="bar-chart-outline"
            iconType="Ionicons"
            screen="/screens/settings/liveClasses/ClassesReports"
            hasArrow={true}
          />

        </View>
      </View>
     }


        {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.sectionCard}>

         <SettingItem
            title="Change Password"
            icon="lock-closed-outline"
            iconType="Ionicons"
            screen="/screens/settings/changePassword"
            hasArrow={true}
          />
          <View style={styles.divider} />
          <SettingItem
            title="Privacy Policy"
            icon="shield-checkmark-outline"
            iconType="Ionicons"
            screen="/screens/settings/privacy"
            hasArrow={true}
          />
          <View style={styles.divider} />
          <SettingItem
            title="Terms & Condtions"
            icon="document-text-outline"
            iconType="Ionicons"
            screen="/screens/settings/terms"
            hasArrow={true}
          />
 
          <View style={styles.divider} />
          <SettingItem
            title="Contact Support"
            icon="call-outline"
            screen="/screens/settings/support"
            iconType="Ionicons"
            hasArrow={true}
          />
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutBtn}>
        <Ionicons name="log-out-outline" size={22} color="#ff4444" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
        
    </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 5,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
    marginLeft: 5,
  },
  sectionCard: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 15,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.light.backgroundSelected,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIconContainer: {
    backgroundColor: '#ff444420',
  },
  settingTitle: {
    fontSize: 15,
    color: Colors.light.text,
  },
  logoutText: {
    color: '#ff4444',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginLeft: 60,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 30,
    paddingVertical: 15,
    backgroundColor: '#ff444420',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff4444',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  versionText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
});