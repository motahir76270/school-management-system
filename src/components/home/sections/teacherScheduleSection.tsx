import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useSelector } from 'react-redux';

interface ScheduleItem {
  id: string;
  day: string;
  date: number;
  month: string;
  subject: string;
  time: string;
  room: string;
  classInfo?: string;
  section?: string;
}

const ScheduleCard = ({ item, colors }: { item: ScheduleItem; colors: any }) => {
  return (
    <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
      <View style={styles.dateContainer}>
        <Text style={[styles.day, { color: colors.textSecondary }]}>{item.day}</Text>
        <Text style={[styles.date, { color: colors.primary }]}>{item.date}</Text>
      </View>
      
      <View style={styles.cardContent}>
        <Text style={[styles.subject, { color: colors.text }]}>{item.subject}</Text>
        {item.classInfo && (
          <Text style={[styles.classInfo, { color: colors.textSecondary }]}>
            {item.classInfo} {item.section ? `- Section ${item.section}` : ''}
          </Text>
        )}
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.room || 'Room not assigned'}</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.moreButton}>
        <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

const TeacherScheduleSection = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const timetableData = useSelector((state: any) => state.timeTable.timeTableData);

  // Transform API data to schedule items
  const scheduleData = useMemo(() => {
    if (!timetableData?.slots || timetableData.slots.length === 0) {
      return [];
    }

    // Create a map of day to date for easy lookup
    const dayDateMap: Record<string, string> = {};
    timetableData.days?.forEach((day: any) => {
      dayDateMap[day.key] = day.date;
    });

 

    // OPTION 1: Show ALL classes (for testing or full schedule view)
    const showAllClasses = true; // Set to true to show all, false to show only upcoming

    // Filter slots
    let filteredSlots = timetableData.slots;

    if (!showAllClasses) {
      // Filter only upcoming classes
      const now = new Date();
      const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();

      filteredSlots = timetableData.slots.filter((slot: any) => {
        const slotDateStr = dayDateMap[slot.day];
        if (!slotDateStr) return false;

        const slotDate = new Date(slotDateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        slotDate.setHours(0, 0, 0, 0);

        const isToday = slotDate.getTime() === today.getTime();
        const isFuture = slotDate.getTime() > today.getTime();

        if (isFuture) return true;
        if (isToday) {
          const [endHour, endMinute] = slot.end_time.split(':').map(Number);
          const endTimeMinutes = endHour * 60 + endMinute;
          return endTimeMinutes > currentTimeMinutes;
        }
        return false;
      });
    }

    // Sort by day of week (Monday first) and then by time
    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    const sortedSlots = [...filteredSlots].sort((a: any, b: any) => {
      // First sort by day
      const dayA = dayOrder.indexOf(a.day);
      const dayB = dayOrder.indexOf(b.day);
      
      if (dayA !== dayB) {
        return dayA - dayB;
      }
      
      // Then sort by start time
      const [startHourA, startMinuteA] = a.start_time.split(':').map(Number);
      const [startHourB, startMinuteB] = b.start_time.split(':').map(Number);
      return (startHourA * 60 + startMinuteA) - (startHourB * 60 + startMinuteB);
    });

    // Limit to first 10 classes (or remove slice to show all)
    const limitedSlots = sortedSlots.slice(0, 10);


    // Transform to ScheduleItem format
    return limitedSlots.map((slot: any) => {
      const slotDateStr = dayDateMap[slot.day];
      const dateObj = slotDateStr ? new Date(slotDateStr) : new Date();
      
      // Get day abbreviation (Mon, Tue, etc.)
      const dayAbbr = slot.day_label 
        ? slot.day_label.substring(0, 3) 
        : slot.day.substring(0, 3);
      
      // Get month abbreviation (Jan, Feb, etc.)
      const monthAbbr = dateObj.toLocaleDateString('en-US', { month: 'short' });
      
      return {
        id: slot.id || `${slot.day}-${slot.start_time}`,
        day: dayAbbr,
        date: dateObj.getDate(),
        month: monthAbbr,
        subject: slot.title || slot.subject || 'Class',
        time: slot.time_label || `${slot.start_time} - ${slot.end_time}`,
        room: slot.room ? `Room ${slot.room}` : 'Room not assigned',
        classInfo: slot.class || '',
        section: slot.section || ''
      };
    });
  }, [timetableData]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Schedule</Text>
        <TouchableOpacity>
          <Text style={[styles.viewAll, { color: colors.primary }]}></Text>
        </TouchableOpacity>
      </View>
      
      {scheduleData.length > 0 ? (
        <FlatList
          data={scheduleData.slice(0, 3)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ScheduleCard item={item} colors={colors} />}
          scrollEnabled={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No classes scheduled
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    marginBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
  },
  dateContainer: {
    alignItems: 'center',
    marginRight: 15,
    minWidth: 50,
  },
  day: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
  date: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardContent: {
    flex: 1,
  },
  subject: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  classInfo: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  detailText: {
    fontSize: 12,
    marginLeft: 6,
  },
  moreButton: {
    padding: 8,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});

export default TeacherScheduleSection;