import React, { useEffect, useState } from 'react';
import {  StyleSheet, useColorScheme, Dimensions, Alert } from 'react-native';
import { Colors } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useDispatch, useSelector } from 'react-redux';
import { getTecaherClassNotesOption } from '@/hooks/apiCalls/teacher';
import TeacherClassNotes from '@/components/features/teachers/classNotes';
import StudentClassNotes from '@/components/features/students/classNotes';
import { setClassNotesType } from '@/redux/classNoteSlice';
import { FullScreenLoader } from '@/hooks/use-screensLoder';
import { getStudentClassNotesOption } from '@/hooks/apiCalls/student';


const { width } = Dimensions.get('window');

export default function AnalysisScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false)
  const { user } = useSelector((state: any) => state.auth);

  const fetchClassNotesTypes = async() => {
    setLoading(true)
    try {
      let res;
       if(user?.role === "teacher"){
           res = await getTecaherClassNotesOption();
       }else{
           res = await getStudentClassNotesOption()
       } 
        if(res?.success === true){
           dispatch(setClassNotesType(res))
        }else{
           Alert.alert("Failed", res?.message);
        }
    } catch {
        Alert.alert("Warning", "Server not respose! Please check internet connections")
    } finally{
      setLoading(false)
    }
  }
  useEffect(()=> {
      fetchClassNotesTypes();
  },[])

  
  return (
    <ThemedView style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={[colors.primary, colors.tertiary || colors.secondary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
       >
        <SafeAreaView style={styles.header}>
          <ThemedText style={styles.headerTitle} themeColor="background">
            Class Notes
          </ThemedText>
          <ThemedText style={styles.headerSubtitle} themeColor="background">
            Overview Notes Manage
          </ThemedText>
        </SafeAreaView>
      </LinearGradient>

      { user?.role === "teacher" ?
       <TeacherClassNotes loading={loading} setLoading={setLoading} />
       :
       <StudentClassNotes />
       }

       <FullScreenLoader loading={loading} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    marginTop: -15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 40) / 2 - 10,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  lastSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  subjectCard: {
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
  },
  gradeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gradeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  subjectProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  attendanceText: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 35,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activityIcon: {
    marginRight: 12,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
  },
  activityStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
});