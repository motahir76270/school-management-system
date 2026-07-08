import { View, Text, StyleSheet, useColorScheme, RefreshControl, FlatList, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { Colors } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'

// Define interfaces for student timetable data
interface DayInfo {
  key: string;
  label: string;
  date: string;
  date_label: string;
}

interface TimeSlot {
  id: string;
  day: string;
  day_label: string;
  slot_type: string;
  title: string;
  start_time: string;
  end_time: string;
  time_label: string;
  subject: string | null;
  teacher: string | null;
  room: string | null;
}

interface StudentTimeTableResponse {
  success: boolean;
  message: string;
  week_label: string;
  class: string;
  section: string;
  days: DayInfo[];
  slots: TimeSlot[];
}

interface StudentTimeTableProps {
  timeTableData: StudentTimeTableResponse | null;
  setTimeTableData?: (data: any) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const StudentTimeTable = ({ 
  timeTableData, 
  setTimeTableData, 
  refreshing = false, 
  onRefresh 
}: StudentTimeTableProps) => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const [selectedDay, setSelectedDay] = useState<string>('monday');

  // Get selected day's slots
  const getSelectedDaySlots = () => {
    if (!timeTableData) return [];
    return timeTableData.slots.filter(slot => slot.day === selectedDay);
  };

  // Get day info for the selected day
  const getSelectedDayInfo = () => {
    if (!timeTableData) return null;
    return timeTableData.days.find(d => d.key === selectedDay);
  };

  const selectedSlots = getSelectedDaySlots();
  const selectedDayInfo = getSelectedDayInfo();

  // Get day slot count
  const getDaySlotCount = (dayKey: string) => {
    if (!timeTableData) return 0;
    return timeTableData.slots.filter(slot => slot.day === dayKey).length;
  };

  // Get slot type icon
  const getSlotTypeIcon = (slotType: any): keyof typeof Ionicons.glyphMap => {
    switch(slotType?.toLowerCase()) {
      case 'lunch': return 'restaurant-outline';
      case 'period': return 'book-outline';
      case 'activity': return 'basketball-outline';
      default: return 'time-outline';
    }
  };

  // Get slot type color
  const getSlotTypeColor = (slotType: string) => {
    switch(slotType?.toLowerCase()) {
      case 'lunch': return '#FF9800';
      case 'period': return '#4CAF50';
      case 'break': return '#2196F3';
      case 'activity': return '#9C27B0';
      default: return '#757575';
    }
  };

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
          {timeTableData.days.map((day) => {
            const isSelected = selectedDay === day.key;
            const hasSlots = getDaySlotCount(day.key) > 0;
            const slotCount = getDaySlotCount(day.key);
            
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
                  {day.date_label.split(' ')[0] || ''}
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
    const slotTypeColor = getSlotTypeColor(item.slot_type);
    const isLunch = item.slot_type?.toLowerCase() === 'lunch';
    
    return (
      <View style={[
        styles.slotCard, 
        { 
          backgroundColor: colors.card,
          borderLeftWidth: 4,
          borderLeftColor: slotTypeColor
        }
      ]}>
        <View style={styles.slotHeader}>
          <View style={styles.slotTimeContainer}>
            <Ionicons name={getSlotTypeIcon(item.slot_type)} size={18} color={slotTypeColor} />
            <Text style={[styles.slotTime, { color: colors.text }]}>
              {item.time_label}
            </Text>
          </View>
          <View style={[styles.slotTypeBadge, { backgroundColor: slotTypeColor + '15' }]}>
            <Text style={[styles.slotTypeText, { color: slotTypeColor }]}>
              {item.slot_type?.toUpperCase() || 'PERIOD'}
            </Text>
          </View>
        </View>

        <View style={styles.slotBody}>
          <Text style={[
            styles.slotSubject, 
            { 
              color: isLunch ? slotTypeColor : colors.text,
              fontSize: isLunch ? 18 : 16
            }
          ]}>
            {item.title || item.subject || 'No Subject'}
          </Text>
          
          {!isLunch && item.subject && item.subject !== item.title && (
            <Text style={[styles.slotSubjectSecondary, { color: colors.textSecondary }]}>
              Subject: {item.subject}
            </Text>
          )}
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
          {!item.teacher && !item.room && !isLunch && (
            <Text style={[styles.noDetailsText, { color: colors.textSecondary }]}>
              No additional details
            </Text>
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
            <Text style={[styles.className, { color: colors.text }]}>
              {timeTableData.class} - {timeTableData.section}
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
            <Ionicons name="book-outline" size={12} color={colors.textSecondary} />
            <Text style={[styles.headerInfoText, { color: colors.textSecondary }]}>
              {timeTableData.slots.length} total classes
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Selected Day Info Header
  const renderDayInfo = () => {
    if (!selectedDayInfo) return null;
    
    // Count different slot types for the selected day
    const lunchCount = selectedSlots.filter(s => s.slot_type?.toLowerCase() === 'lunch').length;
    const periodCount = selectedSlots.filter(s => s.slot_type?.toLowerCase() === 'period').length;
    
    return (
      <View style={[styles.dayInfoContainer, { backgroundColor: colors.card }]}>
        <View>
          <Text style={[styles.dayInfoTitle, { color: colors.text }]}>
            {selectedDayInfo.label}
          </Text>
          <Text style={[styles.dayInfoDate, { color: colors.textSecondary }]}>
            {selectedDayInfo.date_label}
          </Text>
        </View>
        <View style={styles.dayInfoStats}>
          {periodCount > 0 && (
            <View style={styles.dayInfoStat}>
              <Ionicons name="book-outline" size={14} color={colors.primary} />
              <Text style={[styles.dayInfoStatText, { color: colors.textSecondary }]}>
                {periodCount}
              </Text>
            </View>
          )}
          {lunchCount > 0 && (
            <View style={styles.dayInfoStat}>
              <Ionicons name="restaurant-outline" size={14} color="#FF9800" />
              <Text style={[styles.dayInfoStatText, { color: colors.textSecondary }]}>
                {lunchCount}
              </Text>
            </View>
          )}
          <Text style={[styles.dayInfoCount, { color: colors.textSecondary }]}>
            {selectedSlots.length} class{selectedSlots.length > 1 ? 'es' : ''}
          </Text>
        </View>
      </View>
    );
  };

  if (!timeTableData) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyMainContainer}>
          <Ionicons name="calendar-outline" size={80} color={colors.textSecondary} />
          <Text style={[styles.emptyMainText, { color: colors.text }]}>No Timetable Available</Text>
          <Text style={[styles.emptyMainSubtext, { color: colors.textSecondary }]}>
            No schedule has been assigned for this week.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container]}>
      {renderHeader()}
      {renderDayTabs()}
      {renderDayInfo()}
      
      <FlatList
        data={selectedSlots}
        renderItem={renderSlot}
        keyExtractor={(item) => item.id}
        refreshControl={
          onRefresh ? (
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              colors={[colors.primary]} 
              tintColor={colors.primary}
            />
          ) : undefined
        }
        contentContainerStyle={styles.slotsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        style={styles.flatList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  },
  flatList: {
    // flex: 1,
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
  className: {
    fontSize: 17,
    fontWeight: '700',
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
    justifyContent: 'flex-start',
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
    backgroundColor: '#FF6B6B',
  },
  slotIndicatorText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
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
    marginTop: 2,
  },
  dayInfoStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayInfoStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  dayInfoStatText: {
    fontSize: 12,
    marginLeft: 2,
  },
  dayInfoCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  slotsList: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    flexGrow: 1,
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
    fontWeight: '600',
    marginBottom: 2,
  },
  slotSubjectSecondary: {
    fontSize: 13,
    marginTop: 2,
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
  noDetailsText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
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
  },
});

export default StudentTimeTable;