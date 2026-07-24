import { View, Text, Alert, useColorScheme, FlatList, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import HeaderSection from '@/components/features/header'

import { useDispatch, useSelector } from 'react-redux'

import { FullScreenLoader } from '@/hooks/use-screensLoder'
import { Colors } from '@/constants/theme'

import { getStudentNoticeData, getTeacherNoticeData, setNoticeData } from '@/redux/slices/noticeSlice'
import { showError, showInfo } from '@/components/service/AlertService'


// Define the Notice type
interface Notice {
  id: string;
  title: string;
  body: string;
  published_at: string;
  published_at_label: string;
  target_type: string;
}

const Notices = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { noticeData } = useSelector((state: any) => state.notice);
  const { user } = useSelector((state: any) => state.auth);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      let res ;
      if(user?.role === "teacher"){
        res = await getTeacherNoticeData();
      }else{
        res = await getStudentNoticeData();
      }
  
      if (res?.success === true) {
        dispatch(setNoticeData(res?.notices));
      } else {
        showError(res?.message || "Failed to fetch notices");
      }
    } catch (error) {
      showInfo("Server not responding! Please check internet connection");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [dispatch]);

  // Render each notice item
  const renderNoticeItem = ({ item }: { item: Notice }) => (
    <View style={[styles.noticeCard, { backgroundColor: colors.card }]}>
      <Text style={[styles.noticeTitle, { color: colors.textPrimary }]}>
        {item.title}
      </Text>
      <Text style={[styles.noticeBody, { color: colors.textSecondary }]}>
        {item.body}
      </Text>
      <Text style={[styles.noticeDate, { color: colors.text }]}>
        {item.published_at_label}
      </Text>
      <View style={styles.tagContainer}>
        <Text style={[styles.tag, { backgroundColor: colors.primary, color: '#fff' }]}>
          {item.target_type}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderSection title="Notices" />
      
      {noticeData && noticeData.length > 0 ? (
        <FlatList
          data={noticeData}
          renderItem={renderNoticeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        !loading && (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No notices available
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
  noticeCard: {
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
  noticeTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  noticeBody: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  noticeDate: {
    fontSize: 12,
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  tag: {
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: 'hidden',
    fontWeight: '500',
    textTransform: 'capitalize',
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

export default Notices;