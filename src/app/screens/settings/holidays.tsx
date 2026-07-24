import { View, Text, useColorScheme, Alert, FlatList, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import HeaderSection from '@/components/features/header'
import { Colors } from '@/constants/theme';
import { useDispatch, useSelector } from 'react-redux';


import { FullScreenLoader } from '@/hooks/use-screensLoder';
import { getStudentHolidayData, getTeacherHolidayData, setHolidayData } from '@/redux/slices/noticeSlice';
import { showError, showInfo } from '@/components/service/AlertService';

// Define the Holiday type
interface Holiday {
  id: string;
  title: string;
  description: string;
  from_date: string;
  to_date: string;
  total_days: number;
  status: 'past' | 'upcoming' | 'ongoing';
  is_ongoing: boolean;
  is_upcoming: boolean;
  announced_at: string;
  announced_at_label: string;
  date_range_label: string;
}

const Holidays = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { holidayData } = useSelector((state: any) => state.notice);
  const { user } = useSelector((state: any) => state.auth);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      let res;
      if (user?.role === "teacher") {
        res = await getTeacherHolidayData();
      } else {
        res = await getStudentHolidayData();
      }
      if (res?.success === true) {
        dispatch(setHolidayData(res?.holidays));
      } else {
        showError(res?.message || "Failed to fetch holidays");
      }
    } catch (error) {
       showInfo("Server not responding! Please check internet connection");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, [dispatch, user?.role]);

  // Get status color based on holiday status
  const getStatusColor = (status: string, colors: any) => {
    switch (status) {
      case 'upcoming':
        return colors.info || '#2196F3';
      case 'ongoing':
        return colors.success || '#4CAF50';
      case 'past':
        return colors.error || '#F44336';
      default:
        return colors.textSecondary || '#666';
    }
  };

  // Get status label with emoji
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming':
        return '🕐 Upcoming';
      case 'ongoing':
        return '🟢 Ongoing';
      case 'past':
        return '🔴 Past';
      default:
        return status;
    }
  };

  // Render each holiday item
  const renderHolidayItem = ({ item }: { item: Holiday }) => (
    <View style={[styles.holidayCard, { backgroundColor: colors.card }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.holidayTitle, { color: colors.textPrimary }]}>
          {item.title}
        </Text>

        
        <View style={[
          styles.statusBadge, 
          { backgroundColor: getStatusColor(item.status, colors) + '20' }
        ]}>
          <Text style={[
            styles.statusText, 
            { color: getStatusColor(item.status, colors) }
          ]}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>

      {item.description && (
        <Text style={[styles.holidayDescription, { color: colors.textSecondary }]}>
          {item.description}
        </Text>
      )}

      <View style={styles.dateContainer}>
        <Text style={[styles.dateRange, { color: colors.textPrimary }]}>
          📅 {item.date_range_label}
        </Text>
        <Text style={[styles.totalDays, { color: colors.text }]}>
          {item.total_days} day{item.total_days > 1 ? 's' : ''}
        </Text>
      </View>

      <Text style={[styles.announcedDate, { color: colors.text }]}>
        Announced: {item.announced_at_label}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderSection title="Holidays" />
      
      {holidayData && holidayData.length > 0 ? (
        <FlatList
          data={holidayData}
          renderItem={renderHolidayItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        !loading && (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No holidays available
            </Text>
          </View>
        )
      )}
      
      <FullScreenLoader loading={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  holidayCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  holidayTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  holidayDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dateRange: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalDays: {
    fontSize: 13,
    fontWeight: '500',
  },
  announcedDate: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
  },
});

export default Holidays;