import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, Alert, TextInput, Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import HeaderSection from '@/components/features/header';
import { getStudentAttendance } from '@/hooks/apiCalls/student';
import { FullScreenLoader } from '@/hooks/use-screensLoder';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getTeacherAttendance } from '@/hooks/apiCalls/teacher';
import { useSelector } from 'react-redux';

interface AttendanceRecord {
  id: string;
  date: string;
  date_label: string;
  method: string;
  remarks: string | null;
  status: 'present' | 'absent' | 'half_day' | 'late' | 'leave';
  status_label: string;
}

interface AttendanceStats {
  present: number;
  absent: number;
  half_day: number;
  late: number;
  leave: number;
  total: number;
}

interface AttendanceData {
  filter_type: string;
  leaves: any[];
  message: string;
  month: string;
  month_label: string;
  records: AttendanceRecord[];
  stats: AttendanceStats;
  success: boolean;
}

const Attendance = () => {
  const scheme = useColorScheme();
  const  user  = useSelector((state: any) => state.auth.user);
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedMonthParsed, setSelectedMonthParsed] = useState('');
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'present':
        return '#4CAF50';
      case 'absent':
        return '#F44336';
      case 'half_day':
        return '#FF9800';
      case 'late':
        return '#FFC107';
      case 'leave':
        return '#9C27B0';
      default:
        return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'present':
        return 'checkmark-circle';
      case 'absent':
        return 'close-circle';
      case 'half_day':
        return 'time';
      case 'late':
        return 'alert-circle';
      case 'leave':
        return 'calendar';
      default:
        return 'help-circle';
    }
  };

const fetchAttendance = async (month?: string) => {
  setLoading(true);

  try {
    // Use provided month or current month (YYYY-MM)
    const monthParam = month || new Date().toISOString().slice(0, 7);

    let res;
    if (user?.role === "teacher") {
      res = await getTeacherAttendance(monthParam);
    } else {
      res = await getStudentAttendance(monthParam);
    }

    if (res?.success) {
      setAttendanceData(res);
      setSelectedMonth(res.month_label || "");
      setSelectedMonthParsed(res.month || monthParam);
      setFilteredRecords(res.records || []);
    } else {
      Alert.alert("Failed", res?.message || "Failed to load attendance");
    }
  } catch (error) {
    Alert.alert("Error", "An error occurred while fetching attendance");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    if (attendanceData?.records) {
      if (searchQuery.trim() === '') {
        setFilteredRecords(attendanceData.records);
      } else {
        const filtered = attendanceData.records.filter(record => 
          record.date_label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.status_label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.method.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredRecords(filtered);
      }
    }
  }, [searchQuery, attendanceData]);

  const getOverallPercentage = () => {
    if (!attendanceData?.stats) return 0;
    const { present, total } = attendanceData.stats;
    return total > 0 ? (present / total) * 100 : 0;
  };

  const overallPercentage = getOverallPercentage();

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return '#4CAF50';
    if (percentage >= 75) return '#FFC107';
    return '#F44336';
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    if (!selectedMonthParsed) return;
    
    const [year, month] = selectedMonthParsed.split('-').map(Number);
    let newMonth = direction === 'next' ? month + 1 : month - 1;
    let newYear = year;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear = year + 1;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear = year - 1;
    }
    
    // Format: YYYY-MM (parsed format)
    const newMonthStr = `${newYear}-${String(newMonth).padStart(2, '0')}`;
    fetchAttendance(newMonthStr);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const monthStr = `${year}-${month}`;
      fetchAttendance(monthStr);
    }
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  return (
    <View style={styles.mainContainer}>
      <HeaderSection title="Attendance" />
      
      <ScrollView 
        style={[styles.scrollContainer, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Overall Stats Card */}
          <View style={[styles.overallCard, { backgroundColor: colors.card }]}>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#4CAF50' }]}>
                  {attendanceData?.stats?.present || 0}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Present</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#F44336' }]}>
                  {attendanceData?.stats?.absent || 0}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Absent</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#FF9800' }]}>
                  {overallPercentage.toFixed(1)}%
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Overall Attendance</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#9C27B0' }]}>
                  {attendanceData?.stats?.leave || 0}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Leave</Text>
              </View>
            </View>
            
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${overallPercentage}%`, backgroundColor: getAttendanceColor(overallPercentage) }]} />
            </View>
          </View>

          {/* Month Selector */}
          <View style={styles.monthSelector}>
            <TouchableOpacity onPress={() => handleMonthChange('prev')}>
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={openDatePicker} style={styles.monthPickerButton}>
              <Text style={[styles.monthText, { color: colors.text }]}>
                {selectedMonth || attendanceData?.month_label || 'Loading...'}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} style={styles.calendarIcon} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => handleMonthChange('next')}>
              <Ionicons name="chevron-forward" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          {/* Search Filter - Not passed to API */}
          <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search by date or status..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Records List */}
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <View key={record.id} style={[styles.recordCard, { backgroundColor: colors.card }]}>
                <View style={styles.recordHeader}>
                  <View style={styles.dateContainer}>
                    <Text style={[styles.dateText, { color: colors.text }]}>
                      {record.date_label}
                    </Text>
                    <View style={[styles.methodBadge, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.methodText, { color: colors.primary }]}>
                        {record.method?.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(record.status) + '20' }]}>
                    <Ionicons 
                      name={getStatusIcon(record.status)} 
                      size={16} 
                      color={getStatusColor(record.status)} 
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(record.status) }]}>
                      {record.status_label}
                    </Text>
                  </View>
                </View>
                
                {record.remarks && (
                  <Text style={[styles.remarksText, { color: colors.textSecondary }]}>
                    Remarks: {record.remarks}
                  </Text>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={60} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {searchQuery ? 'No matching records found' : 'No attendance records for this month'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      <FullScreenLoader loading={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  overallCard: {
    margin: 15,
    marginTop: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  overallLabel: {
    fontSize: 14,
    marginBottom: 10,
  },
  overallPercentage: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  monthPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
  },
  calendarIcon: {
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    marginVertical: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    padding: 0,
  },
  recordCard: {
    margin: 15,
    marginVertical: 8,
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  methodBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  methodText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  remarksText: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default Attendance;