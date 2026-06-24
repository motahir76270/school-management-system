import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface ScheduleItem {
  id: string;
  day: string;
  date: number;
  month: string;
  subject: string;
  time: string;
  room: string;
}

const scheduleData: ScheduleItem[] = [
  {
    id: '1',
    day: 'Jan',
    date: 25,
    month: 'Jan',
    subject: 'Economy Class',
    time: '09:00 - 11:00 AM',
    room: 'Room (2, 2nd Floor)'
  },
  {
    id: '2',
    day: 'Jan',
    date: 26,
    month: 'Jan',
    subject: 'Geography Class',
    time: '09:00 - 11:00 AM',
    room: 'Room (2, 2nd floor)'
  },
  {
    id: '3',
    day: 'Jan',
    date: 27,
    month: 'Jan',
    subject: 'Accounting Class',
    time: '09:00 - 11:00 AM',
    room: 'Room (2, 2nd Floor)'
  }
];

const ScheduleCard = ({ item, colors }: { item: ScheduleItem; colors: any }) => {
  return (
    <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
      <View style={styles.dateContainer}>
        <Text style={[styles.day, { color: colors.textSecondary }]}>{item.day}</Text>
        <Text style={[styles.date, { color: colors.primary }]}>{item.date}</Text>
      </View>
      
      <View style={styles.cardContent}>
        <Text style={[styles.subject, { color: colors.text }]}>{item.subject}</Text>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.room}</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.moreButton}>
        <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

const ScheduleSection = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Schedule</Text>
        <TouchableOpacity>
          <Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={scheduleData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ScheduleCard item={item} colors={colors} />}
        scrollEnabled={false}
        contentContainerStyle={styles.listContainer}
      />
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
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  detailText: {
    fontSize: 12,
    marginLeft: 6,
  },
  moreButton: {
    padding: 8,
  },
});

export default ScheduleSection;