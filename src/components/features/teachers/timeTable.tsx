import { View, Text, StyleSheet, useColorScheme, RefreshControl, FlatList, TouchableOpacity ,ScrollView} from 'react-native'
import React, { useEffect, useState } from 'react'
import { getTeacherTimeTable } from '@/hooks/apiCalls/teacher'
import { FullScreenLoader } from '@/hooks/use-screensLoder'
import { Colors } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'
import { useDispatch } from 'react-redux';


// Define interfaces based on the actual data structure
interface TimeSlot {
  id: string;
  class: string;
  day: string;
  day_label: string;
  end_time: string;
  room: string | null;
  school_class_id: string;
  section: string;
  section_id: string;
  slot_type: string;
  slot_type_label: string;
  start_time: string;
  subject: string;
  subject_id: string;
  teacher: string;
  teacher_id: string;
  time_label: string;
  title: string;
  updated_at: string;
  updated_at_label: string;
}

interface DaySlot {
  key: string;
  label: string;
  slots: TimeSlot[];
}

interface DayInfo {
  date: string;
  date_label: string;
  key: string;
  label: string;
}

interface TeacherInfo {
  employee_id: string;
  full_name: string;
  id: string;
}

interface TimeTableResponse {
  success: boolean;
  message: string;
  by_day: DaySlot[];
  days: DayInfo[];
  last_updated_at: string;
  last_updated_at_label: string;
  slot_count: number;
  slots: TimeSlot[];
  teacher: TeacherInfo;
  week_label: string;
}

const TeacherTimeTable = ({timeTableData,setTimeTableData}:any) => {
  const scheme = useColorScheme();
  const dispatch = useDispatch()
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  

  const fetchTableData = async () => {
    try {
      const res = await getTeacherTimeTable(dispatch);
      if (res?.success === true) {
        setTimeTableData(res);
        if (res.by_day && res.by_day.length > 0) {
          setSelectedDay(res.by_day[0].key);
        }
      } else {
        setTimeTableData(null);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      setTimeTableData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTableData();
  };

  useEffect(() => {
    fetchTableData();
  }, []);

  // Get selected day's slots
  const getSelectedDaySlots = () => {
    if (!timeTableData) return [];
    const day = timeTableData.by_day.find((d:any) => d.key === selectedDay);
    return day ? day.slots : [];
  };

  // Get day info for the selected day
  const getSelectedDayInfo = () => {
    if (!timeTableData) return null;
    return timeTableData.days.find((d:any) => d.key === selectedDay);
  };

  const selectedSlots = getSelectedDaySlots();
  const selectedDayInfo = getSelectedDayInfo();

  // Render Day Tabs
  const renderDayTabs = () => {
    if (!timeTableData) return null;
    
    return (
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          {timeTableData.by_day.map((day:any) => {
            const isSelected = selectedDay === day.key;
            const hasSlots = day.slots.length > 0;
            
            return (
              <TouchableOpacity
                key={day.key}
                style={[
                  styles.tabButton,
                  { backgroundColor: colors.card },
                  isSelected && { 
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                  !isSelected && { borderColor: colors.border }
                ]}
                onPress={() => setSelectedDay(day.key)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.tabDay,
                  { color: colors.textSecondary },
                  isSelected && { color: '#FFFFFF' }
                ]}>
                  {day.label.substring(0, 3)}
                </Text>
                <Text style={[
                  styles.tabDate,
                  { color: colors.textSecondary },
                  isSelected && { color: '#FFFFFF' }
                ]}>
                  {timeTableData.days.find((d:any) => d.key === day.key)?.date_label?.split(' ')[0] || ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  // Render Individual Slot
  const renderSlot = ({ item }: { item: TimeSlot }) => {
    return (
      <View style={[styles.slotCard, { backgroundColor: colors.card }]}>
        <View style={styles.slotHeader}>
          <View style={styles.slotTimeContainer}>
            <Ionicons name="time-outline" size={18} color={colors.primary} />
            <Text style={[styles.slotTime, { color: colors.text }]}>
              {item.time_label}
            </Text>
          </View>
          <View style={[styles.slotTypeBadge, { backgroundColor: colors.primary + '15' }]}>
            <Text style={[styles.slotTypeText, { color: colors.primary }]}>
              {item.slot_type_label}
            </Text>
          </View>
        </View>

        <View style={styles.slotBody}>
          <Text style={[styles.slotSubject, { color: colors.text }]}>
            {item.subject}
          </Text>
          <View style={styles.slotMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {item.class} - {item.section}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.slotFooter}>
          {item.teacher && (
            <View style={styles.footerItem}>
              <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                {item.teacher}
              </Text>
            </View>
          )}
          {item.room && (
            <View style={styles.footerItem}>
              <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                Room {item.room}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Render Empty State for selected day
  const renderEmptyState = () => {
    return (
      <View style={styles.emptyStateContainer}>
        <View style={[styles.emptyStateIcon, { backgroundColor: colors.card }]}>
          <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
        </View>
        <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
          No Classes Scheduled
        </Text>
        <Text style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}>
          There are no classes for {selectedDayInfo?.label || 'this day'}
        </Text>
      </View>
    );
  };

  // Render Header
  const renderHeader = () => {
    if (!timeTableData) return null;
    
    return (
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.teacherName, { color: colors.text }]}>
              {timeTableData.teacher.full_name}
            </Text>
            <Text style={[styles.teacherId, { color: colors.textSecondary }]}>
              {timeTableData.teacher.employee_id}
            </Text>
          </View>
          <View style={[styles.weekBadge, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="calendar" size={14} color={colors.primary} />
            <Text style={[styles.weekText, { color: colors.primary }]}>
              {timeTableData.week_label}
            </Text>
          </View>
        </View>
        <View style={styles.headerBottom}>
          <View style={styles.headerInfo}>
            <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
            <Text style={[styles.headerInfoText, { color: colors.textSecondary }]}>
              Updated: {timeTableData.last_updated_at_label}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Ionicons name="book-outline" size={12} color={colors.textSecondary} />
            <Text style={[styles.headerInfoText, { color: colors.textSecondary }]}>
              {timeTableData.slot_count} classes
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Selected Day Info Header
  const renderDayInfo = () => {
    if (!selectedDayInfo) return null;
    
    return (
      <View style={[styles.dayInfoContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.dayInfoTitle, { color: colors.text }]}>
          {selectedDayInfo.label}
        </Text>
        <Text style={[styles.dayInfoDate, { color: colors.textSecondary }]}>
          {selectedDayInfo.date_label}
        </Text>
        <Text style={[styles.dayInfoCount, { color: colors.textSecondary }]}>
          {selectedSlots.length} class{selectedSlots.length > 1 ? 'es' : ''}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <FullScreenLoader loading={true} />
      </View>
    );
  }

  if (!timeTableData || timeTableData.slot_count === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyMainContainer}>
          <Ionicons name="calendar-outline" size={80} color={colors.textSecondary} />
          <Text style={[styles.emptyMainText, { color: colors.text }]}>No Timetable Available</Text>
          <Text style={[styles.emptyMainSubtext, { color: colors.textSecondary }]}>
            No schedule has been assigned for this week.
          </Text>
          <TouchableOpacity 
            style={[styles.refreshButton, { backgroundColor: colors.primary }]}
            onPress={onRefresh}
          >
            <Ionicons name="refresh-outline" size={20} color="#FFF" />
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      {renderDayTabs()}
      {renderDayInfo()}
      
      <FlatList
        data={selectedSlots}
        renderItem={renderSlot}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[colors.primary]} 
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.slotsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
   
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    paddingBottom: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  teacherName: {
    fontSize: 17,
    fontWeight: '700',
  },
  teacherId: {
    fontSize: 11,
    marginTop: 1,
  },
  weekBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  weekText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerInfoText: {
    fontSize: 10,
    marginLeft: 4,
  },
  tabsContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  tabsScrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 64,
    position: 'relative',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  tabDay: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabDate: {
    fontSize: 10,
    marginTop: 1,
  },
  slotIndicator: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotIndicatorActive: {
    backgroundColor: '#FFFFFF',
  },
  slotIndicatorInactive: {
    backgroundColor: "#817171",
    borderRadius:20,
    zIndex:1111
  },
  slotIndicatorText: {
    fontSize: 10,
    fontWeight: '700',
  },
  dayInfoContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  dayInfoDate: {
    fontSize: 12,
  },
  dayInfoCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  slotsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  slotCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotTime: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  slotTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  slotTypeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  slotBody: {
    marginLeft: 24,
    marginBottom: 6,
  },
  slotSubject: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  slotMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
  },
  slotFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 24,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
    marginTop: 4,
  },
  footerText: {
    fontSize: 12,
    marginLeft: 4,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontSize: 14,
  },
  emptyMainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyMainText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptyMainSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default TeacherTimeTable;